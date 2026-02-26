/**
 * Utility functions for extracting client information from Request headers.
 */

export function getClientIP(request: Request): string {
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "Unknown IP";

  // x-forwarded-for can be a comma-separated list, return the first one
  return ip.split(",")[0].trim();
}

export function getClientDevice(request: Request): string {
  return request.headers.get("user-agent") || "Unknown Device";
}

export function getCurrentDateFormatted(): string {
  return new Date().toLocaleString();
}
