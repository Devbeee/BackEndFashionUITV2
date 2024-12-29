import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrderProduct1735408300905 implements MigrationInterface {
  name = 'OrderProduct1735408300905';
  
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "order_product" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "name" character varying NOT NULL, 
                "price" integer NOT NULL, 
                "slug" character varying NOT NULL, 
                "size" character varying NOT NULL, 
                "colorName" character varying, 
                "color" character varying NOT NULL, 
                "imgUrl" character varying NOT NULL, 
                "quantity" integer NOT NULL, 
                "discount" integer NOT NULL, 
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "deletedAt" TIMESTAMP WITH TIME ZONE, 
                "orderId" uuid, 
                CONSTRAINT "PK_539ede39e518562dfdadfddb492" PRIMARY KEY ("id")
            )`,
    );

    await queryRunner.query(
      `ALTER TABLE "order_product" 
      ADD CONSTRAINT "FK_3fb066240db56c9558a91139431" 
      FOREIGN KEY ("orderId") REFERENCES "order"("id") 
      ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_product" DROP CONSTRAINT "FK_3fb066240db56c9558a91139431"`,
    );
    await queryRunner.query(`DROP TABLE "order_product"`);
  }
}
