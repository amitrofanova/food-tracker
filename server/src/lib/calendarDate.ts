const CALENDAR_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** UTC midnight of a real YYYY-MM-DD. Prisma `@db.Date` stores that calendar day. */
export function parseCalendarDate(value: string): Date | null {
  const match = CALENDAR_DATE.exec(value.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

/** Format a `@db.Date` value. Prisma returns it as UTC midnight, so local getters would shift the day. */
export function formatUtcCalendarDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
