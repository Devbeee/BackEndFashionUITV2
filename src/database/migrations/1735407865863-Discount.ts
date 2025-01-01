import { MigrationInterface, QueryRunner } from 'typeorm';

export class Discount1735407865863 implements MigrationInterface {
  name = 'Discount1735407865863';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
        `CREATE TABLE "discount" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
        "discountValue" integer NOT NULL, 
        "sold" integer NOT NULL DEFAULT '0', 
        "timeRange" character varying NOT NULL, 
        "date" TIMESTAMP WITH TIME ZONE NOT NULL, 
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
        "productId" uuid, 
        CONSTRAINT "UQ_ff4d15fb01dc6881377349d28c3" UNIQUE ("productId", "timeRange", "date"),
        CONSTRAINT "PK_d05d8712e429673e459e7f1cddb" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `ALTER TABLE "discount" ADD CONSTRAINT "FK_63f33bfcb610459080764863792" 
      FOREIGN KEY ("productId") REFERENCES "product"("id") 
      ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "discount" DROP CONSTRAINT "FK_63f33bfcb610459080764863792"`,
    );
    await queryRunner.query(`DROP TABLE "discount"`);
  }
}
