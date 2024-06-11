import { MigrationInterface, QueryRunner } from 'typeorm';

export class FakeMigration1716139239023 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    // Step 1: Rename the column
    await queryRunner.query(`ALTER TABLE "product_review" RENAME COLUMN "authorName" TO "customerId"`, undefined);

    // Step 2: Add a temporary column for updates without constraints
    await queryRunner.query(`ALTER TABLE "product_review" ADD COLUMN "tempCustomerId" integer`, undefined);

    // Step 3: Update the temporary column with the desired value
    await queryRunner.query(`UPDATE "product_review" SET "tempCustomerId" = 1`, undefined);

    // Step 4: Drop the original column
    await queryRunner.query(`ALTER TABLE "product_review" DROP COLUMN "customerId"`, undefined);

    // Step 5: Rename the temporary column to the original column name
    await queryRunner.query(`ALTER TABLE "product_review" RENAME COLUMN "tempCustomerId" TO "customerId"`, undefined);

    // Step 6: Alter the column to set it as NOT NULL
    await queryRunner.query(`ALTER TABLE "product_review" ALTER COLUMN "customerId" SET NOT NULL`, undefined);

    // Step 7: Add the foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "product_review" ADD CONSTRAINT "FK_73994c5bf5e1fa155b6f5237ea2" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    // Step 1: Drop foreign key constraint
    await queryRunner.query(`ALTER TABLE "product_review" DROP CONSTRAINT "FK_73994c5bf5e1fa155b6f5237ea2"`, undefined);

    // Step 2: Add a temporary column for updates without constraints
    await queryRunner.query(`ALTER TABLE "product_review" ADD COLUMN "tempCustomerId" character varying NOT NULL`, undefined);

    // Step 3: Update the temporary column with the original column values
    await queryRunner.query(`UPDATE "product_review" SET "tempCustomerId" = "customerId"`, undefined);

    // Step 4: Drop the column
    await queryRunner.query(`ALTER TABLE "product_review" DROP COLUMN "customerId"`, undefined);

    // Step 5: Rename the temporary column back to the original column name
    await queryRunner.query(`ALTER TABLE "product_review" RENAME COLUMN "tempCustomerId" TO "authorName"`, undefined);
  }
}
