import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReviewMoods1714237034178 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`CREATE TYPE "public"."product_review_generalmood_enum" AS ENUM('NEGATIVE', 'NEUTRAL', 'POSITIVE', 'UNKNOWN')`, undefined);
    await queryRunner.query(`ALTER TABLE "product_review" ADD "generalMood" "public"."product_review_generalmood_enum" NOT NULL DEFAULT 'UNKNOWN'`, undefined);
    await queryRunner.query(`CREATE TYPE "public"."product_review_productmood_enum" AS ENUM('NEGATIVE', 'NEUTRAL', 'POSITIVE', 'UNKNOWN')`, undefined);
    await queryRunner.query(`ALTER TABLE "product_review" ADD "productMood" "public"."product_review_productmood_enum" NOT NULL DEFAULT 'UNKNOWN'`, undefined);
    await queryRunner.query(`CREATE TYPE "public"."product_review_pricemood_enum" AS ENUM('NEGATIVE', 'NEUTRAL', 'POSITIVE', 'UNKNOWN')`, undefined);
    await queryRunner.query(`ALTER TABLE "product_review" ADD "priceMood" "public"."product_review_pricemood_enum" NOT NULL DEFAULT 'UNKNOWN'`, undefined);
    await queryRunner.query(`CREATE TYPE "public"."product_review_deliverymood_enum" AS ENUM('NEGATIVE', 'NEUTRAL', 'POSITIVE', 'UNKNOWN')`, undefined);
    await queryRunner.query(
      `ALTER TABLE "product_review" ADD "deliveryMood" "public"."product_review_deliverymood_enum" NOT NULL DEFAULT 'UNKNOWN'`,
      undefined,
    );
    await queryRunner.query(`ALTER TABLE "product_review" ADD "importance" integer`, undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "product_review" DROP COLUMN "importance"`, undefined);
    await queryRunner.query(`ALTER TABLE "product_review" DROP COLUMN "deliveryMood"`, undefined);
    await queryRunner.query(`DROP TYPE "public"."product_review_deliverymood_enum"`, undefined);
    await queryRunner.query(`ALTER TABLE "product_review" DROP COLUMN "priceMood"`, undefined);
    await queryRunner.query(`DROP TYPE "public"."product_review_pricemood_enum"`, undefined);
    await queryRunner.query(`ALTER TABLE "product_review" DROP COLUMN "productMood"`, undefined);
    await queryRunner.query(`DROP TYPE "public"."product_review_productmood_enum"`, undefined);
    await queryRunner.query(`ALTER TABLE "product_review" DROP COLUMN "generalMood"`, undefined);
    await queryRunner.query(`DROP TYPE "public"."product_review_generalmood_enum"`, undefined);
  }
}
