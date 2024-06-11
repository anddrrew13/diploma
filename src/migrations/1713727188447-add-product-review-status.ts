import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductReviewStatus1713727188447 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`CREATE TYPE "public"."product_review_status_enum" AS ENUM('pending', 'approved', 'rejected')`, undefined);
    await queryRunner.query(`ALTER TABLE "product_review" ADD "status" "public"."product_review_status_enum" NOT NULL DEFAULT 'pending'`, undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "product_review" DROP COLUMN "status"`, undefined);
    await queryRunner.query(`DROP TYPE "public"."product_review_status_enum"`, undefined);
  }
}
