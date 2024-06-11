import { Customer, DeepPartial, EntityId, ID, Product, VendureEntity } from '@vendure/core';
import OpenAI from 'openai';
import { Column, Entity, ManyToOne } from 'typeorm';
import { ProductReviewMood, ProductReviewStatus } from '../../../generated/admin.types';

@Entity()
export class ProductReview extends VendureEntity {
  constructor(input?: DeepPartial<ProductReview>) {
    super(input);
  }

  @ManyToOne(() => Product)
  product: Product;

  @EntityId()
  productId: ID;

  @Column()
  text: string;

  @Column()
  rating: number;

  @EntityId()
  customerId: ID;

  @ManyToOne(() => Customer)
  customer: Customer;

  @Column({ type: 'enum', enum: ProductReviewStatus, default: ProductReviewStatus.PENDING })
  status: ProductReviewStatus;

  @Column({ type: 'enum', enum: ProductReviewMood, nullable: true })
  generalMood: ProductReviewMood;

  @Column({ type: 'enum', enum: ProductReviewMood, nullable: true })
  productMood: ProductReviewMood;

  @Column({ type: 'enum', enum: ProductReviewMood, nullable: true })
  priceMood: ProductReviewMood;

  @Column({ type: 'enum', enum: ProductReviewMood, nullable: true })
  deliveryMood: ProductReviewMood;

  @Column({ type: 'numeric', nullable: true })
  score: number | null;

  @Column({ type: 'boolean', nullable: true })
  spamFlagged: boolean | null;

  @Column({ type: 'boolean', nullable: true })
  moderationFlagged: boolean | null;

  @Column({ type: 'json', nullable: true })
  moderationResult: OpenAI.Moderation | null;

  @Column({ type: 'varchar', nullable: true })
  summary: string | null;

  @Column({ type: 'varchar', nullable: true })
  aiExplanation: string | null;
}
