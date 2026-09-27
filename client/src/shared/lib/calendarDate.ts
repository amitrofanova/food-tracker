/** Local calendar day as YYYY-MM-DD. Not UTC, and not `Date#toISOString`. */
export function localCalendarDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const CALENDAR_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Move a YYYY-MM-DD by whole local days. `YYYY-MM-DD` is never parsed with `new Date(string)`. */
export function shiftCalendarDate(isoDate: string, days: number): string {
  const match = CALENDAR_DATE.exec(isoDate);
  if (!match) {
    throw new Error("Invalid calendar date");
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const shifted = new Date(year, month - 1, day + days);
  return localCalendarDate(shifted);
}
