import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTables1606963863035 implements MigrationInterface {
  name = 'CreateTables1606963863035';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "keys" ("id" varchar PRIMARY KEY NOT NULL, "key" varchar NOT NULL, "username" varchar NOT NULL, "provider" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`,
    );
    await queryRunner.query(
      `CREATE TABLE "monkey_business" ("id" varchar PRIMARY KEY NOT NULL, "biz" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "monkey_business"`);
    await queryRunner.query(`DROP TABLE "keys"`);
  }
}
