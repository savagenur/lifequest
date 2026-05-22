/**
 * Date Utilities
 * --------------
 * Centralized date handling for consistent local timezone support.
 * All date strings use YYYY-MM-DD format for database storage.
 */

/**
 * Formats a Date object to YYYY-MM-DD string using local timezone.
 * This is the canonical format for scheduledDate and batch date fields.
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Gets today's date string in YYYY-MM-DD format using local timezone.
 * Use this on the client side to send to the server.
 */
export function getTodayLocalDateString(): string {
  return formatLocalDate(new Date());
}

/**
 * Parses a YYYY-MM-DD string to a Date object at midnight local time.
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Checks if two dates are the same day (local timezone).
 */
export function isSameLocalDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Gets the difference in days between two dates (local timezone).
 * Returns positive if date1 is after date2.
 */
export function getDaysDifference(date1: Date, date2: Date): number {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.floor((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
}
