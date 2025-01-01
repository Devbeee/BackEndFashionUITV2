import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserDefaultAddress1735413770049 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" 
            ADD CONSTRAINT "FK_5eacc78647d44cf60808dd94d53" 
            FOREIGN KEY ("defaultAddressId") REFERENCES "address"("id") 
            ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "address" 
        ADD CONSTRAINT "FK_07b1b3a3084ea2cd82495739482" 
        FOREIGN KEY ("owner") REFERENCES 
        "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_5eacc78647d44cf60808dd94d53"`,
    );
    await queryRunner.query(
      `ALTER TABLE "address" DROP CONSTRAINT "FK_07b1b3a3084ea2cd82495739482"`,
    );
  }
}
