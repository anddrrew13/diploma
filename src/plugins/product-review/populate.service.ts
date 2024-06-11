import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { Logger, Product, RequestContext, RequestContextService, TransactionalConnection } from '@vendure/core';
import { loggerCtx } from './constants';
import { ProductReview } from './entities/product-review.entity';
import { ProductReviewStatus } from '../../generated/admin.types';

const AMOUNT_OF_REVIEWS_TO_POPULATE = 10;

@Injectable()
export class ProductReviewPopulateService {
  constructor(
    private connection: TransactionalConnection,
    private contextService: RequestContextService,
  ) {}

  async populate() {
    const ctx = await this.contextService.create({
      apiType: 'custom',
    });

    for (let i = 0; i < AMOUNT_OF_REVIEWS_TO_POPULATE; ) {
      const product = await this.chooseRandomProduct(ctx);

      const amount = faker.number.int({
        min: 1,
        max: Math.min(AMOUNT_OF_REVIEWS_TO_POPULATE - i, 3),
      });

      await this.createReviews(ctx, product, amount);

      i += amount;
      Logger.info(`Created ${amount} reviews for product ${product.id}`, loggerCtx);
    }
  }

  private async chooseRandomProduct(ctx: RequestContext): Promise<Product> {
    const product = await this.connection
      .getRepository(ctx, Product)
      .createQueryBuilder('product')
      .where('product.deletedAt IS NULL')
      .orderBy('RANDOM()')
      .limit(1)
      .getOne();

    if (!product) {
      throw new Error('No products found');
    }

    return product;
  }

  private async createReviews(ctx: RequestContext, product: Product, amount: number) {
    const reviews = Array.from({ length: amount }, () => this.generateReview());
    return await this.connection.getRepository(ctx, ProductReview).save(
      reviews.map((review) => ({
        productId: product.id,
        ...review,
      })),
    );
  }

  private generateReview(): Pick<ProductReview, 'authorName' | 'rating' | 'text' | 'status'> {
    return {
      authorName: faker.person.fullName(),
      rating: faker.number.int({
        min: 1,
        max: 5,
      }),
      text: faker.lorem.paragraph(),
      status: faker.helpers.arrayElement(Object.values(ProductReviewStatus)),
    };
  }
}
