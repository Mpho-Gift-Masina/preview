import { COLLECTION } from '../config';

const pad = (n: number) => String(n).padStart(2, '0');

/** Local date as YYYY-MM-DD (the format <input type="date"> uses). */
export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Turns "YYYY-MM-DD" back into a local Date (avoids timezone shifts). */
function parse(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** True if the store is closed on that date (see COLLECTION.closedWeekdays). */
export function isClosed(iso: string): boolean {
  return COLLECTION.closedWeekdays.includes(parse(iso).getDay());
}

/** First day a customer can collect: today + lead days, skipping closed days. */
export function earliestCollectionDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + COLLECTION.leadDays);
  while (COLLECTION.closedWeekdays.includes(d.getDay())) d.setDate(d.getDate() + 1);
  return toISODate(d);
}

/** Friendly date for display, e.g. "Monday, 26 October". */
export function formatDate(iso: string): string {
  return parse(iso).toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' });
}
