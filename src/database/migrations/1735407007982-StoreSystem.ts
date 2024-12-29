import { MigrationInterface, QueryRunner } from 'typeorm';

export class StoreSystem1735407007982 implements MigrationInterface {
  name = 'StoreSystem1735407007982';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "store_system" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
        "province" character varying NOT NULL, 
        "ward" character varying, 
        "district" character varying NOT NULL, 
        "phoneNumber" character varying NOT NULL, 
        "longitude" character varying, 
        "latitude" character varying, 
        "addressDetail" character varying NOT NULL, 
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_af7c1db21a2685d7768becd79a9" PRIMARY KEY ("id")
        )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "store_system"`);
  }
}
