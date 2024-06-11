import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Logger, ProcessContext, RequestContextService } from '@vendure/core';
import { ProductReviewQueueService } from './product-review-queue.service';
import { loggerCtx } from '../constants';

@Injectable()
export class ProductReviewCronService {
  constructor(
    private processContext: ProcessContext,
    private contextService: RequestContextService,
    private productReviewQueueService: ProductReviewQueueService,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async processProductReviews() {
    if (!this.processContext.isServer) return;
    const ctx = await this.contextService.create({
      apiType: 'custom',
    });

    Logger.info('Triggering processProductReview job', loggerCtx);
    await this.productReviewQueueService.triggerProcessProductReview(ctx);
  }
}
