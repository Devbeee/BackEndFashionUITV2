import { MigrationInterface, QueryRunner } from 'typeorm';

export class User1735407007993 implements MigrationInterface {
  name = 'User1735407007993';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
        `CREATE TABLE "user" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
        "fullName" character varying NOT NULL, 
        "email" character varying NOT NULL, 
        "password" character varying NOT NULL, 
        "phoneNumber" character varying, 
        "avatar" character varying, 
        "isVerified" boolean NOT NULL DEFAULT false, 
        "role" character varying NOT NULL DEFAULT 'user', 
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
        "deletedAt" TIMESTAMP WITH TIME ZONE, 
        "defaultAddressId" uuid, 
        CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), 
        CONSTRAINT "REL_5eacc78647d44cf60808dd94d5" UNIQUE ("defaultAddressId"), 
        CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_5eacc78647d44cf60808dd94d53"`,
    );
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
