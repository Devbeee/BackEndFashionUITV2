import { MigrationInterface, QueryRunner } from 'typeorm';

export class Address1735407007994 implements MigrationInterface {
  name = 'Address1735407007994';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "address" (
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
        "owner" uuid, 
        CONSTRAINT "PK_d92de1f82754668b5f5f5dd4fd5" PRIMARY KEY ("id")
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "address"`);
  }
}
