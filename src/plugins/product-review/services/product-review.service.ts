import { Injectable } from '@nestjs/common';
import { DeletionResponse, DeletionResult } from '@vendure/common/lib/generated-types';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { ListQueryBuilder, ListQueryOptions, RelationPaths, RequestContext, TransactionalConnection, assertFound, patchEntity } from '@vendure/core';
import { UpdateProductReviewInput } from '../../../generated/admin.types';
import { CreateProductReviewInput } from '../../../generated/shop.types';
import { ProductReview } from '../entities/product-review.entity';

@Injectable()
export class ProductReviewService {
  constructor(
    private connection: TransactionalConnection,
    private listQueryBuilder: ListQueryBuilder,
  ) {}

  async findAll(
    ctx: RequestContext,
    options?: ListQueryOptions<ProductReview>,
    relations?: RelationPaths<ProductReview>,
  ): Promise<PaginatedList<ProductReview>> {
    const [items, totalItems] = await this.listQueryBuilder
      .build(ProductReview, options, {
        relations,
        ctx,
      })
      .getManyAndCount();
    return {
      items,
      totalItems,
    };
  }

  findOne(ctx: RequestContext, id: ID, relations?: RelationPaths<ProductReview>): Promise<ProductReview | null> {
    return this.connection.getRepository(ctx, ProductReview).findOne({
      where: { id },
      relations,
    });
  }

  async create(ctx: RequestContext, input: CreateProductReviewInput): Promise<ProductReview> {
    // const customer = await this.connection.getEntityOrThrow(ctx, Customer, ctx.activeUserId || '');
    // const authorName = `${customer.firstName} ${customer.lastName}`;

    const newEntity = await this.connection.getRepository(ctx, ProductReview).save({ ...input });
    return assertFound(this.findOne(ctx, newEntity.id));
  }

  async update(ctx: RequestContext, input: UpdateProductReviewInput): Promise<ProductReview> {
    const entity = await this.connection.getEntityOrThrow(ctx, ProductReview, input.id);
    const updatedEntity = patchEntity(entity, input);
    await this.connection.getRepository(ctx, ProductReview).save(updatedEntity, { reload: false });
    return assertFound(this.findOne(ctx, updatedEntity.id));
  }

  async delete(ctx: RequestContext, id: ID): Promise<DeletionResponse> {
    const entity = await this.connection.getEntityOrThrow(ctx, ProductReview, id);
    try {
      await this.connection.getRepository(ctx, ProductReview).remove(entity);
      return {
        result: DeletionResult.DELETED,
      };
    } catch (e: any) {
      return {
        result: DeletionResult.NOT_DELETED,
        message: e.toString(),
      };
    }
  }
}
