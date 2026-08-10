"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envConfig = {
    PORT: process.env.PORT ?? "4000",
    NODE_ENV: process.env.NODE_ENV ?? "development",
    MONGO_URI: process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/ugopeters",
    CLIENT_URL: process.env.CLIENT_URL ?? "http://localhost:5173",
    // Admin auth (CMS)
    JWT_SECRET: process.env.JWT_SECRET ?? "dev-only-insecure-secret-change-me",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",
    // Seed script credentials (default to the frontend's demo login)
    ADMIN_NAME: process.env.ADMIN_NAME ?? "Ugo Peters",
    ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? "admin@ugopeters.com",
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? "admin123",
    // Cloudinary (blog image uploads)
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ?? "",
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ?? "",
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ?? "",
    CLOUDINARY_FOLDER: process.env.CLOUDINARY_FOLDER ?? "ugopeters/blog",
    // Email (Resend primary, SMTP fallback) — unset ⇒ email is skipped, not an error.
    RESEND_API_KEY: process.env.RESEND_API_KEY ?? "",
    EMAIL_FROM: process.env.EMAIL_FROM ?? "Ugo Peters <onboarding@resend.dev>",
    // `||` (not `??`) so a present-but-empty var falls back instead of sending to "".
    CONTACT_NOTIFY_EMAIL: process.env.CONTACT_NOTIFY_EMAIL ||
        process.env.ADMIN_EMAIL ||
        "admin@ugopeters.com",
    SMTP_HOST: process.env.SMTP_HOST ?? "",
    SMTP_PORT: process.env.SMTP_PORT ?? "587",
    SMTP_USER: process.env.SMTP_USER ?? "",
    SMTP_PASS: process.env.SMTP_PASS ?? "",
};
exports.default = envConfig;
//# sourceMappingURL=env.configuration.js.map