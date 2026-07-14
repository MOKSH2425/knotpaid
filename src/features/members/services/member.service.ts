import { db } from "@/database/db";

export function createMember(groupId: string, name: string) {
  db.runSync(
    `
      INSERT INTO members
      (
        id,
        groupId,
        name,
        avatar,
        createdAt
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      Date.now().toString() + Math.random(),
      groupId,
      name.trim(),
      "",
      new Date().toISOString(),
    ],
  );
}

export function getMembers(groupId: string) {
  return db.getAllSync<{
    id: string;
    name: string;
  }>(
    `
      SELECT *
      FROM members
      WHERE groupId=?
      ORDER BY createdAt ASC
    `,
    [groupId],
  );
}

export function memberHasExpenses(memberId: string) {
  const paidExpense = db.getFirstSync<{ id: string }>(
    `
      SELECT id
      FROM expenses
      WHERE paidBy=?
      LIMIT 1
    `,
    [memberId],
  );

  if (paidExpense) return true;

  const sharedExpense = db.getFirstSync<{ id: string }>(
    `
      SELECT id
      FROM expense_shares
      WHERE memberId=?
      LIMIT 1
    `,
    [memberId],
  );

  return Boolean(sharedExpense);
}

export function updateMember(
  memberId: string,
  name: string,
) {
  db.runSync(
    `
      UPDATE members
      SET name=?
      WHERE id=?
    `,
    [name.trim(), memberId],
  );
}

export function deleteMember(memberId: string) {
  db.runSync(
    `
      DELETE FROM expense_shares
      WHERE memberId=?
    `,
    [memberId],
  );

  db.runSync(
    `
      DELETE FROM members
      WHERE id=?
    `,
    [memberId],
  );
}
