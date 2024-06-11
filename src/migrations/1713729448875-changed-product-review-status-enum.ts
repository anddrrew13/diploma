import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangedProductReviewStatusEnum1713729448875 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TYPE "public"."product_review_status_enum" RENAME TO "product_review_status_enum_old"`, undefined);
    await queryRunner.query(`CREATE TYPE "public"."product_review_status_enum" AS ENUM('APPROVED', 'PENDING', 'REJECTED')`, undefined);
    await queryRunner.query(`ALTER TABLE "product_review" ALTER COLUMN "status" DROP DEFAULT`, undefined);
    await queryRunner.query(
      `ALTER TABLE "product_review" ALTER COLUMN "status" TYPE "public"."product_review_status_enum" USING "status"::"text"::"public"."product_review_status_enum"`,
      undefined,
    );
    await queryRunner.query(`ALTER TABLE "product_review" ALTER COLUMN "status" SET DEFAULT 'PENDING'`, undefined);
    await queryRunner.query(`DROP TYPE "public"."product_review_status_enum_old"`, undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`CREATE TYPE "public"."product_review_status_enum_old" AS ENUM('pending', 'approved', 'rejected')`, undefined);
    await queryRunner.query(`ALTER TABLE "product_review" ALTER COLUMN "status" DROP DEFAULT`, undefined);
    await queryRunner.query(
      `ALTER TABLE "product_review" ALTER COLUMN "status" TYPE "public"."product_review_status_enum_old" USING "status"::"text"::"public"."product_review_status_enum_old"`,
      undefined,
    );
    await queryRunner.query(`ALTER TABLE "product_review" ALTER COLUMN "status" SET DEFAULT 'pending'`, undefined);
    await queryRunner.query(`DROP TYPE "public"."product_review_status_enum"`, undefined);
    await queryRunner.query(`ALTER TYPE "public"."product_review_status_enum_old" RENAME TO "product_review_status_enum"`, undefined);
  }
}
