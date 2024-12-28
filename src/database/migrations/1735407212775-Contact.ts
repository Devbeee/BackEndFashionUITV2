import { MigrationInterface, QueryRunner } from 'typeorm';

export class Contact1735407212775 implements MigrationInterface {
  name = 'Contact1735407212775';
  
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "contact" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
        "fullName" character varying NOT NULL, 
        "email" character varying NOT NULL, 
        "phoneNumber" character varying NOT NULL, 
        "description" character varying NOT NULL, 
        "userId" uuid, 
        CONSTRAINT "PK_2cbbe00f59ab6b3bb5b8d19f989" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `ALTER TABLE "contact" 
        ADD CONSTRAINT "FK_e7e34fa8e409e9146f4729fd0cb" 
        FOREIGN KEY ("userId") REFERENCES "user"("id") 
        ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contact" DROP CONSTRAINT "FK_e7e34fa8e409e9146f4729fd0cb"`,
    );
    await queryRunner.query(`DROP TABLE "contact"`);
  }
}
