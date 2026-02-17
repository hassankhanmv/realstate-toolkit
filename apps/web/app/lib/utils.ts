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
