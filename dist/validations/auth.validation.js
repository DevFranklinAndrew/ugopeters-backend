"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLogin = exports.loginSchema = void 0;
const zod_1 = require("zod");
const app_error_1 = __importDefault(require("../errors/app.error"));
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().trim().toLowerCase().email("A valid email is required."),
    password: zod_1.z.string().min(1, "Password is required."),
});
exports.loginSchema = loginSchema;
/**
 * Parses and validates a login payload. Converts zod failures into an
 * operational AppError (422) so the global error handler formats them
 * consistently with the rest of the API.
 */
const validateLogin = (payload) => {
    const result = loginSchema.safeParse(payload);
    if (!result.success) {
        const message = result.error.issues.map((issue) => issue.message).join(". ");
        throw new app_error_1.default(message, 422);
    }
    return result.data;
};
exports.validateLogin = validateLogin;
//# sourceMappingURL=auth.validation.js.map