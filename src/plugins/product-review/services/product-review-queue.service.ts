import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Job, JobQueue, JobQueueService, Logger, RequestContext, SerializedRequestContext, TransactionalConnection } from '@vendure/core';
import OpenAI from 'openai';
import { ProductReviewStatus } from '../../../generated/admin.types';
import { PRODUCT_REVIEW_PLUGIN_OPTIONS, loggerCtx } from '../constants';
import { ProductReview } from '../entities/product-review.entity';
import { PluginInitOptions } from '../types';
import { createMessages, createTools, extractAnalyticsFromChatCompletion } from '../utils/ai-process-review.util';

@Injectable()
export class ProductReviewQueueService implements OnModuleInit {
  private processProductReviewQueue: JobQueue<{ ctx: SerializedRequestContext }>;
  private openAi: OpenAI;

  constructor(
    private connection: TransactionalConnection,
    private jobQueueService: JobQueueService,

    @Inject(PRODUCT_REVIEW_PLUGIN_OPTIONS)
    private options: PluginInitOptions,
  ) {
    this.openAi = new OpenAI({
      apiKey: this.options.openAIKey,
    });
  }

  public async onModuleInit(): Promise<void> {
    this.processProductReviewQueue = await this.jobQueueService.createQueue({
      name: 'process-product-review',
      process: async (job) => {
        Logger.info(`Job:${job.id} Processing product reviews...`, loggerCtx);
        const ctx = RequestContext.deserialize(job.data.ctx);

        const [reviews, total] = await this.connection.getRepository(ctx, ProductReview).findAndCount({
          where: {
            status: ProductReviewStatus.PENDING,
          },
          relations: ['product', 'product.facetValues'],
          select: ['id', 'text', 'rating'],
        });

        let completed = 0;
        let failed = 0;

        await Promise.allSettled(
          reviews.map(async (review) => {
            try {
              const moderation = await this.openAi.moderations.create({
                model: 'text-moderation-stable',
                input: review.text,
              });

              const completion = await this.openAi.chat.completions.create({
                seed: this.options.openAISeed,
                model: 'gpt-4o',
                messages: createMessages(review.product, review, moderation.results),
                tools: createTools(),
              });

              const { explanation, ...analytics } = extractAnalyticsFromChatCompletion(completion);
              Logger.debug(`ReviewId:${review.id} Analytics: ${JSON.stringify(analytics, null, 2)}`, loggerCtx);

              const moderationFlagged = moderation.results[0].flagged;

              await this.connection.getRepository(ctx, ProductReview).update(review.id, {
                ...analytics,
                status: this.getNewStatus(moderationFlagged, analytics.spamFlagged),
                aiExplanation: explanation,
                moderationResult: moderation.results[0],
                moderationFlagged,
              });

              this.setProgress(job, ++completed, failed, total);
            } catch (e) {
              if (e instanceof Error) {
                Logger.error(`ReviewId:${review.id} Error: ${e.message}`, loggerCtx, e.stack);
              }
              this.setProgress(job, completed, ++failed, total);
            }
          }),
        );

        return {
          found: total,
          completed,
          failed,
        };
      },
    });
  }

  public triggerProcessProductReview(ctx: RequestContext) {
    return this.processProductReviewQueue.add({
      ctx: ctx.serialize(),
    });
  }

  public async setProgress(job: Job, finished: number, failed: number, total: number) {
    return job.setProgress(Math.floor(((finished + failed) / total) * 100));
  }

  public getNewStatus(moderationFlagged: boolean, isSpam: boolean) {
    if (moderationFlagged && !isSpam) {
      return ProductReviewStatus.WAITING_FOR_MANUAL_CHECK;
    }

    if (isSpam) {
      return ProductReviewStatus.REJECTED;
    }

    return ProductReviewStatus.APPROVED;
  }
}
