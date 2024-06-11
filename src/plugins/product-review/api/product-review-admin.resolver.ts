import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { DeletionResponse, Permission } from '@vendure/common/lib/generated-types';
import { Allow, Ctx, ID, ListQueryOptions, PaginatedList, RelationPaths, Relations, RequestContext, Transaction } from '@vendure/core';
import { MutationDeleteProductReviewArgs, MutationUpdateProductReviewArgs } from '../../../generated/admin.types';
import { ProductReview } from '../entities/product-review.entity';
import { ProductReviewService } from '../services/product-review.service';

@Resolver()
export class ProductReviewAdminResolver {
  constructor(private productReviewService: ProductReviewService) {}

  @Query()
  @Allow(Permission.SuperAdmin)
  async productReview(
    @Ctx() ctx: RequestContext,
    @Args() args: { id: ID },
    @Relations(ProductReview) relations: RelationPaths<ProductReview>,
  ): Promise<ProductReview | null> {
    return this.productReviewService.findOne(ctx, args.id, relations);
  }

  @Query()
  @Allow(Permission.SuperAdmin)
  async productReviews(
    @Ctx() ctx: RequestContext,
    @Args() args: { options: ListQueryOptions<ProductReview> },
    @Relations(ProductReview) relations: RelationPaths<ProductReview>,
  ): Promise<PaginatedList<ProductReview>> {
    return this.productReviewService.findAll(ctx, args.options || undefined, relations);
  }

  @Mutation()
  @Transaction()
  @Allow(Permission.SuperAdmin)
  async updateProductReview(@Ctx() ctx: RequestContext, @Args() args: MutationUpdateProductReviewArgs): Promise<ProductReview> {
    return this.productReviewService.update(ctx, args.input);
  }

  @Mutation()
  @Transaction()
  @Allow(Permission.SuperAdmin)
  async deleteProductReview(@Ctx() ctx: RequestContext, @Args() args: MutationDeleteProductReviewArgs): Promise<DeletionResponse> {
    return this.productReviewService.delete(ctx, args.id);
  }
}
