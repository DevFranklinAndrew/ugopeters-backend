"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSubscriberSchema = exports.validateCreateSubscriber = void 0;
const zod_1 = require("zod");
const app_error_1 = __importDefault(require("../errors/app.error"));
/** Client-supplied fields for a newsletter subscription (email only). */
const createSubscriberSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .trim()
        .toLowerCase()
        .email("A valid email is required.")
        .max(200, "Email is too long."),
});
exports.createSubscriberSchema = createSubscriberSchema;
const formatIssues = (error) => error.issues.map((issue) => issue.message).join(". ");
/** Validate a subscribe payload; zod failures become an operational AppError (422). */
const validateCreateSubscriber = (payload) => {
    const result = createSubscriberSchema.safeParse(payload);
    if (!result.success)
        throw new app_error_1.default(formatIssues(result.error), 422);
    return result.data;
};
exports.validateCreateSubscriber = validateCreateSubscriber;
//# sourceMappingURL=subscriber.validation.js.map