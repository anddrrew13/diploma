import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddModeration1714310208738 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "product_review" ADD "moderationResult" json`, undefined);
    await queryRunner.query(`ALTER TABLE "product_review" DROP COLUMN "importance"`, undefined);
    await queryRunner.query(`ALTER TABLE "product_review" ADD "importance" numeric`, undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "product_review" DROP COLUMN "importance"`, undefined);
    await queryRunner.query(`ALTER TABLE "product_review" ADD "importance" integer`, undefined);
    await queryRunner.query(`ALTER TABLE "product_review" DROP COLUMN "moderationResult"`, undefined);
  }
}
