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
    const share = expense.amount / members.length;

    balances[expense.paidBy] += expense.amount;

    members.forEach((member) => {
      balances[member.id] -= share;
    });
  });

  return balances;
}