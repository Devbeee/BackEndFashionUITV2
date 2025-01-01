import { MigrationInterface, QueryRunner } from 'typeorm';

export class CartProduct1735408119108 implements MigrationInterface {
  name = 'CartProduct1735408119108';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
        `CREATE TABLE "cart_product" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
        "quantity" integer NOT NULL, 
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
        "productDetailId" uuid, 
        "categoryId" uuid, 
        "cartId" uuid, 
        CONSTRAINT "PK_dccd1ec2d6f5644a69adf163bc1" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_product" 
      ADD CONSTRAINT "FK_99f4d21bce1e534fdb26e678fc5" 
      FOREIGN KEY ("productDetailId") 
      REFERENCES "product_detail"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_product" 
      ADD CONSTRAINT "FK_ef2181f6910b50ab06577392d5d" 
      FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_product" 
      ADD CONSTRAINT "FK_139f8024067696fe5a8400ebda2" 
      FOREIGN KEY ("cartId") REFERENCES "cart"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
       
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cart_product" DROP CONSTRAINT "FK_139f8024067696fe5a8400ebda2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_product" DROP CONSTRAINT "FK_ef2181f6910b50ab06577392d5d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_product" DROP CONSTRAINT "FK_99f4d21bce1e534fdb26e678fc5"`,
    );
    await queryRunner.query(`DROP TABLE "cart_product"`);
  }
}
