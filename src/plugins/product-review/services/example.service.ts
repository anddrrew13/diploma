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

        const reviews = await this.connection.getRepository(ctx, ProductReview).find({
          where: {
            status: ProductReviewStatus.PENDING,
          },
          relations: ['product', 'product.facetValues'],
          select: ['id', 'text', 'rating'],
        });

        await Promise.allSettled(reviews.map(async (review) => await this.processReview(review)));
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
