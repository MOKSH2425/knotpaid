// Small formatting helpers shared by the expense date/time picker and the
// expense list. All input is an ISO string (what's stored in the DB) or a
// Date object.

function toDate(value: string | Date): Date {
  return typeof value === "string" ? new Date(value) : value;
}

export function formatDatePart(value: string | Date): string {
  return toDate(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTimePart(value: string | Date): string {
  return toDate(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

// e.g. "Jul 20, 2026 • 7:30 PM" — used on individual expense cards.
export function formatExpenseDateTime(value: string | Date): string {
  return `${formatDatePart(value)} • ${formatTimePart(value)}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// e.g. "Today", "Yesterday", or "Wednesday, 20 Jul" — used as the section
// header when the expense list is grouped by day.
export function formatDayHeader(value: string | Date): string {
  const date = toDate(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

// A stable key for grouping expenses by calendar day, independent of time.
export function dayKey(value: string | Date): string {
  const date = toDate(value);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
