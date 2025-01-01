import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrderAddress1735408206512 implements MigrationInterface {
  name = 'OrderAddress1735408206512';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "order_address" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
        "name" character varying NOT NULL, 
        "province" character varying NOT NULL, 
        "ward" character varying, 
        "district" character varying NOT NULL, 
        "phoneNumber" character varying NOT NULL, 
        "longitude" character varying, 
        "latitude" character varying, 
        "addressDetail" character varying NOT NULL, 
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
        "deletedAt" TIMESTAMP WITH TIME ZONE, 
        CONSTRAINT "PK_f07603e96b068aae820d4590270" PRIMARY KEY ("id")
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "order_address"`);
  }
}
