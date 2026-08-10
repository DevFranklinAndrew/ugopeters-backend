"use strict";
/**
 * Parsers for Express `req.query` values (always `string | string[] |
 * undefined`) used by list endpoints for paging and filtering. Shared so the
 * controllers don't each re-declare them.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.toBoolean = exports.toPositiveInt = void 0;
/** Parses a query value into a positive integer, or undefined when absent/invalid. */
const toPositiveInt = (value) => {
    if (typeof value !== "string")
        return undefined;
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};
exports.toPositiveInt = toPositiveInt;
/** Parses a query value into a boolean ("true"/"false"), or undefined otherwise. */
const toBoolean = (value) => {
    if (value === "true")
        return true;
    if (value === "false")
        return false;
    return undefined;
};
exports.toBoolean = toBoolean;
//# sourceMappingURL=query.util.js.map