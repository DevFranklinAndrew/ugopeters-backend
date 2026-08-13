import nodemailer, { type Transporter } from "nodemailer";
import { Resend } from "resend";
import envConfig from "./env.configuration";

/**
 * Resend (primary) and SMTP (fallback), both optional — `null` when their
 * credentials are absent, which the email service treats as a skip, not an error.
 *
 * Note: the default `onboarding@resend.dev` sender only delivers to the Resend
 * account owner until you verify a domain and point EMAIL_FROM at it.
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
