import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number or string as a comma-separated number
 * @param value - Number or string to format
 * @returns Formatted string with comma separators
 * @example formatNumber(10000) // "10,000"
 * @example formatNumber("2500000") // "2,500,000"
 */
export function formatNumber(
  value: number | string | null | undefined,
): string {
  if (value === null || value === undefined || value === "") {
    return "0";
  }

  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) {
    return "0";
  }

  return num.toLocaleString("en-US");
}

/**
 * Truncate text to a max length, appending "…" if truncated.
 */
export function truncateText(
  text: string | null | undefined,
  maxLen: number,
): string {
  if (!text) return "";
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + "…";
}

/**
 * Format an ISO date string as a short date.
 * e.g. "Feb 21, 2026" / "٢١ فبراير ٢٠٢٦"
 */
export function formatDateShort(
  isoDate: string | null | undefined,
  locale = "en-US",
): string {
  if (!isoDate) return "—";
  try {
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}

/**
 * Format an ISO date string as a full date with time.
 * e.g. "Friday, Feb 21, 2026, 4:27 AM"
 */
export function formatDateLong(
  isoDate: string | null | undefined,
  locale = "en-US",
): string {
  if (!isoDate) return "—";
  try {
    return new Intl.DateTimeFormat(locale, {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}

/**
 * Format an ISO date string as a relative time.
 * e.g. "3 days ago" / "منذ ٣ أيام"
 */
export function formatTimeAgo(
  isoDate: string | null | undefined,
  locale = "en-US",
): string {
  if (!isoDate) return "—";
  try {
    const now = Date.now();
    const then = new Date(isoDate).getTime();
    const diffMs = now - then;
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHr = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHr / 24);

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

    if (diffDay > 30) return formatDateShort(isoDate, locale);
    if (diffDay >= 1) return rtf.format(-diffDay, "day");
    if (diffHr >= 1) return rtf.format(-diffHr, "hour");
    if (diffMin >= 1) return rtf.format(-diffMin, "minute");
    return rtf.format(-diffSec, "second");
  } catch {
    return isoDate;
  }
}
