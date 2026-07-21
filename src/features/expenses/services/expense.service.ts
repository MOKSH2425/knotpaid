import { db } from "@/database/db";
import { calculateEqualSplit } from "./split.service";

export function createExpense(
  groupId: string,
  title: string,
  amount: number,
  paidBy: string,
  // ISO string — when the expense actually happened, editable and
  // independent from createdAt (the DB insert time). Defaults to "now"
  // if not provided.
  expenseDate: string | undefined,
  // Which members are actually splitting this expense — NOT necessarily
  // every member of the group. A member with no real involvement in any
  // expense should be freely deletable; that only works if this list is
  // the true participant set instead of "everyone, always."
  participantIds: string[],
) {
  if (participantIds.length === 0) {
    throw new Error("An expense must have at least one participant.");
  }

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
        createdAt,
        expenseDate
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      expenseDate ?? new Date().toISOString(),
    ],
  );

  const share = calculateEqualSplit(amount, participantIds.length);

  participantIds.forEach((memberId) => {
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
        expenseId + memberId,
        expenseId,
        memberId,
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
    expenseDate: string;
  }>(
    `
      SELECT *
      FROM expenses
      WHERE groupId=?
      ORDER BY expenseDate DESC, createdAt DESC
    `,
    [groupId],
  );
}

// Which members are currently splitting a given expense — used to
// preload the "Split Between" selection when editing.
export function getExpenseParticipantIds(expenseId: string): string[] {
  const rows = db.getAllSync<{ memberId: string }>(
    `
      SELECT memberId
      FROM expense_shares
      WHERE expenseId=?
    `,
    [expenseId],
  );

  return rows.map((row) => row.memberId);
}

export function updateExpense(
  expenseId: string,
  title: string,
  amount: number,
  paidBy: string,
  expenseDate: string | undefined,
  participantIds: string[],
) {
  if (participantIds.length === 0) {
    throw new Error("An expense must have at least one participant.");
  }

  if (expenseDate) {
    db.runSync(
      `
        UPDATE expenses
        SET
          title=?,
          amount=?,
          paidBy=?,
          expenseDate=?
        WHERE id=?
      `,
      [title.trim(), amount, paidBy, expenseDate, expenseId],
    );
  } else {
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
  }

  db.runSync(
    `
      DELETE FROM expense_shares
      WHERE expenseId=?
    `,
    [expenseId],
  );

  const share = calculateEqualSplit(amount, participantIds.length);

  participantIds.forEach((memberId) => {
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
        expenseId + memberId,
        expenseId,
        memberId,
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
