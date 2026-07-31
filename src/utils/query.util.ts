/**
 * Parsers for Express `req.query` values (always `string | string[] |
 * undefined`) used by list endpoints for paging and filtering. Shared so the
 * controllers don't each re-declare them.
 */

/** Parses a query value into a positive integer, or undefined when absent/invalid. */
export const toPositiveInt = (value: unknown): number | undefined => {
  if (typeof value !== "string") return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

/** Parses a query value into a boolean ("true"/"false"), or undefined otherwise. */
export const toBoolean = (value: unknown): boolean | undefined => {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
};
