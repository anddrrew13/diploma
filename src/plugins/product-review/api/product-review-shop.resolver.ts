import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Ctx, RequestContext, Transaction } from '@vendure/core';
import { MutationCreateProductReviewArgs } from '../../../generated/shop.types';
import { ProductReviewService } from '../services/product-review.service';

@Resolver()
export class ProductReviewShopResolver {
  constructor(private productReviewService: ProductReviewService) {}

  @Mutation()
  @Transaction()
  async createProductReview(@Ctx() ctx: RequestContext, @Args() args: MutationCreateProductReviewArgs): Promise<boolean> {
    await this.productReviewService.create(ctx, args.input);
    return true;
  }
}
