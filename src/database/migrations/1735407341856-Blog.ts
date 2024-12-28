import { MigrationInterface, QueryRunner } from 'typeorm';

export class Blog1735407341856 implements MigrationInterface {
  name = 'Blog1735407341856';
  
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "blog" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
        "title" text NOT NULL, 
        "description" text NOT NULL, 
        "content" text NOT NULL, 
        "slug" text NOT NULL, 
        "userId" uuid NOT NULL, 
        "coverImage" text NOT NULL, 
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
        "deletedAt" TIMESTAMP WITH TIME ZONE, 
        CONSTRAINT "PK_85c6532ad065a448e9de7638571" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `ALTER TABLE "blog" 
        ADD CONSTRAINT "FK_fc46ede0f7ab797b7ffacb5c08d" 
        FOREIGN KEY ("userId") REFERENCES "user"("id") 
        ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "blog" DROP CONSTRAINT "FK_fc46ede0f7ab797b7ffacb5c08d"`,
    );
    await queryRunner.query(`DROP TABLE "blog"`);
  }
}
