"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.smtpTransporter = exports.resendClient = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const resend_1 = require("resend");
const env_configuration_1 = __importDefault(require("./env.configuration"));
/**
 * Email clients built once from the environment (like cloudinary.configuration).
 * Both are optional: when their credentials are absent the export is `null`, and
 * the email service treats "no provider configured" as a skip — never an error.
 * Resend is the primary transport; SMTP (Nodemailer) is the fallback.
 *
 * Note: with the default `onboarding@resend.dev` sender, Resend only delivers to
 * the account owner's own email until you verify a domain (resend.com/domains)
 * and set EMAIL_FROM to an address on it. Until then, sends to any other
 * recipient fail — non-blocking, so the request still succeeds.
 */
exports.resendClient = env_configuration_1.default.RESEND_API_KEY
    ? new resend_1.Resend(env_configuration_1.default.RESEND_API_KEY)
    : null;
exports.smtpTransporter = env_configuration_1.default.SMTP_HOST
    ? nodemailer_1.default.createTransport({
        host: env_configuration_1.default.SMTP_HOST,
        port: Number(env_configuration_1.default.SMTP_PORT),
        secure: Number(env_configuration_1.default.SMTP_PORT) === 465,
        auth: env_configuration_1.default.SMTP_USER
            ? { user: env_configuration_1.default.SMTP_USER, pass: env_configuration_1.default.SMTP_PASS }
            : undefined,
    })
    : null;
//# sourceMappingURL=email.configuration.js.map