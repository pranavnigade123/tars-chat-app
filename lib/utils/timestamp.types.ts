/**
 * Supported timestamp format types
 */
export type TimestampFormat = "message" | "preview" | "relative" | "full";

/**
 * Timestamp input types
 */
export type TimestampInput = Date | string | number | null | undefined;

/**
 * Configuration options for timestamp formatting
 */
export interface TimestampFormatOptions {
  format?: TimestampFormat;
  locale?: string; // For future i18n support
  fallback?: string; // Fallback text for invalid timestamps
}
