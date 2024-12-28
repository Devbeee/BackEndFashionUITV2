import { MigrationInterface, QueryRunner } from 'typeorm';

export class Product1735407595197 implements MigrationInterface {
  name = 'Product1735407595197';
  
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "product" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
          "name" character varying NOT NULL, 
          "description" character varying NOT NULL, 
          "price" integer NOT NULL, 
          "slug" character varying NOT NULL, 
          "discount" integer NOT NULL DEFAULT '0', 
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
          "categoryId" uuid, 
          CONSTRAINT "UQ_22cc43e9a74d7498546e9a63e77" UNIQUE ("name"), 
          CONSTRAINT "UQ_8cfaf4a1e80806d58e3dbe69224" UNIQUE ("slug"), 
          CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id")      
      )`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" 
        ADD CONSTRAINT "FK_ff0c0301a95e517153df97f6812" 
        FOREIGN KEY ("categoryId") REFERENCES "category"("id") 
        ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_ff0c0301a95e517153df97f6812"`,
    );
    await queryRunner.query(`DROP TABLE "product"`);
  }
}
