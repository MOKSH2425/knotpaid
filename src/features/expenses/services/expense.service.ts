import { db } from "@/database/db";
import { getMembers } from "@/features/members/services/member.service";
import { calculateEqualSplit } from "./split.service";

export function createExpense(
  groupId: string,
  title: string,
  amount: number,
  paidBy: string,
) {
  const expenseId = Date.now().toString();

  db.runSync(
    `
      INSERT INTO expenses
      (
        id,
        groupId,
        title,
        description,
        amount,
        paidBy,
        splitType,
        createdAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      expenseId,
      groupId,
      title,
      "",
      amount,
      paidBy,
      "equal",
      new Date().toISOString(),
    ],
  );

  const members = getMembers(groupId);
  const share = calculateEqualSplit(amount, members.length);

  members.forEach((member) => {
    db.runSync(
      `
      INSERT INTO expense_shares
      (
        id,
        expenseId,
        memberId,
        shareAmount
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        expenseId + member.id,
        expenseId,
        member.id,
        share,
      ],
    );
  });
}

export function getExpenses(groupId: string) {
  return db.getAllSync<{
    id: string;
    title: string;
    amount: number;
    paidBy: string;
    createdAt: string;
  }>(
    `
      SELECT *
      FROM expenses
      WHERE groupId=?
      ORDER BY createdAt DESC
    `,
    [groupId],
  );
}

export function updateExpense(
  expenseId: string,
  title: string,
  amount: number,
) {
  db.runSync(
    `
      UPDATE expenses
      SET
        title=?,
        amount=?
      WHERE id=?
    `,
    [title, amount, expenseId],
  );
}

export function deleteExpense(expenseId: string) {
  db.runSync(
    `
      DELETE FROM expense_shares
      WHERE expenseId=?
    `,
    [expenseId],
  );

  db.runSync(
    `
      DELETE FROM expenses
      WHERE id=?
    `,
    [expenseId],
  );
}