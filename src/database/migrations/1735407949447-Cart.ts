import { MigrationInterface, QueryRunner } from 'typeorm';

export class Cart1735407949447 implements MigrationInterface {
  name = 'Cart1735407949447';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
        `CREATE TABLE "cart" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
        "deletedAt" TIMESTAMP WITH TIME ZONE, 
        "userId" uuid, 
        CONSTRAINT "REL_756f53ab9466eb52a52619ee01" UNIQUE ("userId"), 
        CONSTRAINT "PK_c524ec48751b9b5bcfbf6e59be7" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart" 
      ADD CONSTRAINT "FK_756f53ab9466eb52a52619ee019" 
      FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cart" DROP CONSTRAINT "FK_756f53ab9466eb52a52619ee019"`,
    );
    await queryRunner.query(`DROP TABLE "cart"`);
  }
}
