import dotenv from "dotenv";

dotenv.config();

/** Canonical site URL, used for links in outgoing email — a single origin.
 *  The CORS allow-list is CORS_ORIGINS below. */
const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:5173";

const envConfig = {
  PORT: process.env.PORT ?? "4000",
  NODE_ENV: process.env.NODE_ENV ?? "development",
  MONGO_URI: process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/ugopeters",
  CLIENT_URL,

  /** Comma-separated origins allowed to call the API with credentials; setting
   *  it replaces the fallback, which names the production hosts so a missing
   *  CORS_ORIGINS can't silently block the live site. Trailing slashes are
   *  stripped — an Origin header never carries one. */
  CORS_ORIGINS: (
    process.env.CORS_ORIGINS ??
    [
      CLIENT_URL,
      "https://www.ugopeters.net",
      "https://ugopeters-frontend.vercel.app",
    ].join(",")
  )
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean),

  // Admin auth (CMS)
  JWT_SECRET: process.env.JWT_SECRET ?? "dev-only-insecure-secret-change-me",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",

  // Seed script credentials (default to the frontend's demo login)
  ADMIN_NAME: process.env.ADMIN_NAME ?? "Ugo Peters",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? "admin@ugopeters.net",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? "admin123",

  // Cloudinary (blog image uploads)
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ?? "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ?? "",
  CLOUDINARY_FOLDER: process.env.CLOUDINARY_FOLDER ?? "ugopeters/blog",

  // Email (Resend primary, SMTP fallback) — unset ⇒ email is skipped, not an error.
  RESEND_API_KEY: process.env.RESEND_API_KEY ?? "",
  EMAIL_FROM: process.env.EMAIL_FROM ?? "Ugo Peters <onboarding@resend.dev>",
  // `||` not `??`: a present-but-empty var must fall back, not send to "".
  CONTACT_NOTIFY_EMAIL:
    process.env.CONTACT_NOTIFY_EMAIL ||
    process.env.ADMIN_EMAIL ||
    "admin@ugopeters.net",
  SMTP_HOST: process.env.SMTP_HOST ?? "",
  SMTP_PORT: process.env.SMTP_PORT ?? "587",
  SMTP_USER: process.env.SMTP_USER ?? "",
  SMTP_PASS: process.env.SMTP_PASS ?? "",
};

export default envConfig;
