import { db } from "./db";
import { TABLES } from "./schema";

export function runMigrations() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS ${TABLES.GROUPS} (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ${TABLES.MEMBERS} (
      id TEXT PRIMARY KEY NOT NULL,
      groupId TEXT NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ${TABLES.EXPENSES} (
      id TEXT PRIMARY KEY NOT NULL,
      groupId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      amount REAL NOT NULL,
      paidBy TEXT NOT NULL,
      splitType TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ${TABLES.EXPENSE_SHARES} (
      id TEXT PRIMARY KEY NOT NULL,
      expenseId TEXT NOT NULL,
      memberId TEXT NOT NULL,
      shareAmount REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ${TABLES.SETTLEMENTS} (
      id TEXT PRIMARY KEY NOT NULL,
      groupId TEXT NOT NULL,
      fromMemberId TEXT NOT NULL,
      toMemberId TEXT NOT NULL,
      amount REAL NOT NULL,
      settledAt TEXT NOT NULL
    );
  `);

  const groupColumns = db.getAllSync<{ name: string }>(
    `PRAGMA table_info(${TABLES.GROUPS})`,
  );

  const hasGroupType = groupColumns.some((column) => column.name === "type");

  if (!hasGroupType) {
    db.runSync(
      `ALTER TABLE ${TABLES.GROUPS} ADD COLUMN type TEXT NOT NULL DEFAULT 'other'`,
    );
  }

  console.log("Database migrated successfully.");
}
