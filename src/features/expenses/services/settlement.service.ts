import { calculateBalances } from "./balance.service";

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