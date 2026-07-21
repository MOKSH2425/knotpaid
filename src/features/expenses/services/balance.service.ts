import { db } from "@/database/db";
import { getExpenses } from "./expense.service";
import { getMembers } from "@/features/members/services/member.service";

export function calculateBalances(groupId: string) {
  const members = getMembers(groupId);
  const expenses = getExpenses(groupId);

  const balances: Record<string, number> = {};

  members.forEach((member) => {
    balances[member.id] = 0;
  });

  expenses.forEach((expense) => {
    // The payer is credited the full amount regardless of who split it.
    balances[expense.paidBy] = (balances[expense.paidBy] ?? 0) + expense.amount;

    // Each participant is debited their actual share — read from
    // expense_shares, not assumed to be "everyone in the group." A member
    // who wasn't part of this particular expense is correctly untouched.
    const shares = db.getAllSync<{ memberId: string; shareAmount: number }>(
      `
        SELECT memberId, shareAmount
        FROM expense_shares
        WHERE expenseId=?
      `,
      [expense.id],
    );

    shares.forEach((share) => {
      balances[share.memberId] = (balances[share.memberId] ?? 0) - share.shareAmount;
    });
  });

  // Recorded settlements (real payments someone actually made) move
  // balances back toward zero. The payer's debt shrinks — their balance
  // moves up — and the receiver's credit shrinks — their balance moves
  // down — by the amount actually paid. Without this, "Mark as Paid"
  // would have no lasting effect: the same suggested settlement would
  // just reappear on the next screen load.
  const settlements = db.getAllSync<{
    fromMemberId: string;
    toMemberId: string;
    amount: number;
  }>(
    `
      SELECT fromMemberId, toMemberId, amount
      FROM settlements
      WHERE groupId=?
    `,
    [groupId],
  );

  settlements.forEach((settlement) => {
    balances[settlement.fromMemberId] =
      (balances[settlement.fromMemberId] ?? 0) + settlement.amount;
    balances[settlement.toMemberId] =
      (balances[settlement.toMemberId] ?? 0) - settlement.amount;
  });

  return balances;
}
