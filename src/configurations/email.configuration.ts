import nodemailer, { type Transporter } from "nodemailer";
import { Resend } from "resend";
import envConfig from "./env.configuration";

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

export const resendClient = envConfig.RESEND_API_KEY
  ? new Resend(envConfig.RESEND_API_KEY)
  : null;

export const smtpTransporter: Transporter | null = envConfig.SMTP_HOST
  ? nodemailer.createTransport({
      host: envConfig.SMTP_HOST,
      port: Number(envConfig.SMTP_PORT),
      secure: Number(envConfig.SMTP_PORT) === 465,
      auth: envConfig.SMTP_USER
        ? { user: envConfig.SMTP_USER, pass: envConfig.SMTP_PASS }
        : undefined,
    })
  : null;
