import { db } from "@/database/db";
import { calculateBalances } from "./balance.service";

// Records a real, actually-happened payment between two members. This is
// what makes "Mark as Paid" stick — calculateBalances reads this table
// on every call, so the next suggested-settlement list already reflects
// it. Capped loosely at the caller's side (the UI won't let you record
// more than what's owed), not here, since a slightly-over payment isn't
// actually invalid data, just unusual.
export function recordSettlement(
  groupId: string,
  fromMemberId: string,
  toMemberId: string,
  amount: number,
) {
  if (amount <= 0) {
    throw new Error("Settlement amount must be greater than zero.");
  }

  db.runSync(
    `
      INSERT INTO settlements
      (id, groupId, fromMemberId, toMemberId, amount, settledAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      Date.now().toString() + Math.random().toString(36).slice(2, 8),
      groupId,
      fromMemberId,
      toMemberId,
      amount,
      new Date().toISOString(),
    ],
  );
}

// Past recorded payments for a group, most recent first — used to show a
// "Payment History" list and to let a mistaken entry be undone.
export function getSettlementHistory(groupId: string) {
  return db.getAllSync<{
    id: string;
    fromMemberId: string;
    toMemberId: string;
    amount: number;
    settledAt: string;
  }>(
    `
      SELECT *
      FROM settlements
      WHERE groupId=?
      ORDER BY settledAt DESC
    `,
    [groupId],
  );
}

// Undoes a recorded payment. The debt it settled simply reappears in the
// suggested-settlements list on the next balance calculation — nothing
// else needs to change.
export function deleteSettlement(settlementId: string) {
  db.runSync(
    `
      DELETE FROM settlements
      WHERE id=?
    `,
    [settlementId],
  );
}

export function calculateSettlements(groupId: string) {
  const balances = calculateBalances(groupId);

  const creditors: {
    memberId: string;
    amount: number;
  }[] = [];

  const debtors: {
    memberId: string;
    amount: number;
  }[] = [];

  Object.entries(balances).forEach(([memberId, balance]) => {
    if (balance > 0.01) {
      creditors.push({
        memberId,
        amount: balance,
      });
    } else if (balance < -0.01) {
      debtors.push({
        memberId,
        amount: Math.abs(balance),
      });
    }
  });

  const settlements = [];

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(
      debtor.amount,
      creditor.amount
    );

    settlements.push({
      from: debtor.memberId,
      to: creditor.memberId,
      amount,
    });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return settlements;
}