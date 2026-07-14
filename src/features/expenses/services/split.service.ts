export function calculateEqualSplit(
  amount: number,
  members: number
) {
  if (members <= 0) return 0;

  return amount / members;
}
