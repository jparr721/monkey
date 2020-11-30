import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateKeys1606698279281 implements MigrationInterface {
  name = 'CreateKeys1606698279281';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "keys" ("id" varchar PRIMARY KEY NOT NULL, "key" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "keys"`);
  }
}
