import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProductDetail1735407755901 implements MigrationInterface {
  name = 'ProductDetail1735407755901';
  
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
        `CREATE TABLE "product_detail" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
        "size" character varying NOT NULL, 
        "colorName" character varying NOT NULL, 
        "color" character varying NOT NULL, 
        "imgUrl" character varying NOT NULL, 
        "stock" integer NOT NULL, 
        "productId" uuid, 
        CONSTRAINT "PK_12ea67a439667df5593ff68fc33" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_detail" 
      ADD CONSTRAINT "FK_2c1471f10d59111c8d052b0bdbc" 
      FOREIGN KEY ("productId") 
      REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_detail" DROP CONSTRAINT "FK_2c1471f10d59111c8d052b0bdbc"`,
    );
    await queryRunner.query(`DROP TABLE "product_detail"`);
  }
}
