import { db } from "@/database/db";

export function createGroup(name: string) {
  db.runSync(
    `
    INSERT INTO groups
    (
      id,
      name,
      currency,
      createdAt,
      updatedAt
    )
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      Date.now().toString(),
      name,
      "INR",
      new Date().toISOString(),
      new Date().toISOString(),
    ]
  );
}

export function getGroups() {
  return db.getAllSync<{
    id: string;
    name: string;
    currency: string;
    createdAt: string;
    updatedAt: string;
  }>(
    `
      SELECT *
      FROM groups
      ORDER BY createdAt DESC
    `
  );
}
export function getLatestGroup() {
  return db.getFirstSync<{
    id: string;
    name: string;
  }>(
    `
    SELECT *
    FROM groups
    ORDER BY createdAt DESC
    LIMIT 1
    `
  );
}

export function deleteGroup(groupId: string) {
  db.runSync(
    `
    DELETE FROM expense_shares
    WHERE expenseId IN (
      SELECT id
      FROM expenses
      WHERE groupId=?
    )
    `,
    [groupId]
  );

  db.runSync(
    `
    DELETE FROM expenses
    WHERE groupId=?
    `,
    [groupId]
  );

  db.runSync(
    `
    DELETE FROM members
    WHERE groupId=?
    `,
    [groupId]
  );

  db.runSync(
    `
    DELETE FROM groups
    WHERE id=?
    `,
    [groupId]
  );
}

export function updateGroup(
  groupId: string,
  name: string,
) {
  db.runSync(
    `
      UPDATE groups
      SET
        name=?,
        updatedAt=?
      WHERE id=?
    `,
    [
      name,
      new Date().toISOString(),
      groupId,
    ],
  );
}