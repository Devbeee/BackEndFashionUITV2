import { MigrationInterface, QueryRunner } from 'typeorm';

export class Category1735407542711 implements MigrationInterface {
  name = 'Category1735407542711';
  
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "category" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
        "gender" character varying NOT NULL, 
        "type" character varying NOT NULL, 
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
        "deletedAt" TIMESTAMP WITH TIME ZONE, 
        CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id")
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "category"`);
  }
}
