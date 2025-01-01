import { MigrationInterface, QueryRunner } from 'typeorm';

export class Order1735408206513 implements MigrationInterface {
  name = 'Order1735408206513';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "order" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
      "paymentStatus" character varying NOT NULL DEFAULT 'UNPAID', 
      "paymentMethod" character varying NOT NULL DEFAULT 'COD', 
      "orderStatus" character varying NOT NULL DEFAULT 'PENDING', 
      "message" character varying, "totalPrice" integer, 
      "paymentSessionId" character varying, 
      "paymentInvoiceId" character varying, 
      "paidAt" TIMESTAMP, "completedAt" TIMESTAMP, 
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
      "deletedAt" TIMESTAMP WITH TIME ZONE, 
      "userId" uuid, 
      "addressId" uuid, 
      CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" 
      ADD CONSTRAINT "FK_caabe91507b3379c7ba73637b84" 
      FOREIGN KEY ("userId") 
      REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD CONSTRAINT "FK_73f9a47e41912876446d047d015" 
      FOREIGN KEY ("addressId") REFERENCES 
      "order_address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order" DROP CONSTRAINT "FK_73f9a47e41912876446d047d015"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" DROP CONSTRAINT "FK_caabe91507b3379c7ba73637b84"`,
    );
    await queryRunner.query(`DROP TABLE "order"`);
  }
}
