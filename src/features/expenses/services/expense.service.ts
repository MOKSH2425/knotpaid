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
  const members = getMembers(groupId);

  if (members.length === 0) {
    throw new Error("Cannot create an expense without group members.");
  }

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
      title.trim(),
      "",
      amount,
      paidBy,
      "equal",
      new Date().toISOString(),
    ],
  );

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
  paidBy: string,
) {
  const expense = db.getFirstSync<{
    groupId: string;
  }>(
    `
      SELECT groupId
      FROM expenses
      WHERE id=?
    `,
    [expenseId],
  );

  if (!expense) return;

  db.runSync(
    `
      UPDATE expenses
      SET
        title=?,
        amount=?,
        paidBy=?
      WHERE id=?
    `,
    [title.trim(), amount, paidBy, expenseId],
  );

  db.runSync(
    `
      DELETE FROM expense_shares
      WHERE expenseId=?
    `,
    [expenseId],
  );

  const members = getMembers(expense.groupId);
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
