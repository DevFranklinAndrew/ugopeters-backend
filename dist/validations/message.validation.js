"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMessageSchema = exports.createMessageSchema = exports.validateUpdateMessage = exports.validateCreateMessage = void 0;
const zod_1 = require("zod");
const app_error_1 = __importDefault(require("../errors/app.error"));
/**
 * Client-supplied fields for a contact message. `read` and the timestamps are
 * server-owned, so they are NOT accepted here. `.max()` caps keep this public
 * endpoint from being used to store oversized blobs.
 */
const createMessageSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1, "Name is required.").max(200, "Name is too long."),
    email: zod_1.z
        .string()
        .trim()
        .toLowerCase()
        .email("A valid email is required.")
        .max(200, "Email is too long."),
    reason: zod_1.z
        .string()
        .trim()
        .min(1, "Reason is required.")
        .max(200, "Reason is too long."),
    subject: zod_1.z
        .string()
        .trim()
        .min(1, "Subject is required.")
        .max(200, "Subject is too long."),
    message: zod_1.z
        .string()
        .trim()
        .min(1, "Message is required.")
        .max(5000, "Message is too long."),
});
exports.createMessageSchema = createMessageSchema;
// `read` is the only admin-mutable field.
const updateMessageSchema = zod_1.z.object({
    read: zod_1.z.boolean(),
});
exports.updateMessageSchema = updateMessageSchema;
const formatIssues = (error) => error.issues.map((issue) => issue.message).join(". ");
/** Validate a create payload; zod failures become an operational AppError (422). */
const validateCreateMessage = (payload) => {
    const result = createMessageSchema.safeParse(payload);
    if (!result.success)
        throw new app_error_1.default(formatIssues(result.error), 422);
    return result.data;
};
exports.validateCreateMessage = validateCreateMessage;
/** Validate a read-status update; zod failures become an AppError (422). */
const validateUpdateMessage = (payload) => {
    const result = updateMessageSchema.safeParse(payload);
    if (!result.success)
        throw new app_error_1.default(formatIssues(result.error), 422);
    return result.data;
};
exports.validateUpdateMessage = validateUpdateMessage;
//# sourceMappingURL=message.validation.js.map