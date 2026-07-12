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
      name,
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
    [name, memberId],
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