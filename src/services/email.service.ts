import {
  resendClient,
  smtpTransporter,
} from "../configurations/email.configuration";
import envConfig from "../configurations/env.configuration";

interface MailOptions {
  to: string;
  subject: string;
  html: string;
  /** Address replies should go to (e.g. the person who filled the contact form). */
  replyTo?: string;
}

/** Escapes user-supplied text so it can't inject markup into the email HTML. */
const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Wraps body HTML in a minimal branded (gold-accent) layout. */
const layout = (heading: string, bodyHtml: string): string => `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
    <div style="border-top: 4px solid #d4af37; padding: 24px 8px;">
      <h1 style="font-size: 20px; margin: 0 0 16px;">${heading}</h1>
      ${bodyHtml}
      <p style="margin-top: 32px; font-size: 12px; color: #888;">Ugo Peters — ugopeters.com</p>
    </div>
  </div>`;

/**
 * Low-level send. Tries Resend, then SMTP; when neither is configured it logs a
 * skip and returns (email is optional — the request that triggered it already
 * succeeded). Throws only when a configured provider actually fails to send.
 */
const sendMail = async ({
  to,
  subject,
  html,
  replyTo,
}: MailOptions): Promise<void> => {
  if (resendClient) {
    const { error } = await resendClient.emails.send({
      from: envConfig.EMAIL_FROM,
      to,
      subject,
      html,
      replyTo,
    });
    if (error) throw new Error(error.message);
    return;
  }

  if (smtpTransporter) {
    await smtpTransporter.sendMail({
      from: envConfig.EMAIL_FROM,
      to,
      subject,
      html,
      replyTo,
    });
    return;
  }

  console.warn(
    "[email] skipped — no provider configured (set RESEND_API_KEY or SMTP_*).",
  );
};

/** Fields of a contact submission the notification email needs. */
interface ContactNotice {
  name: string;
  email: string;
  reason: string;
  subject: string;
  message: string;
}

/**
 * Notifies Ugo of a new contact-form submission. Best-effort: any failure is
 * logged and swallowed so the caller can fire it and forget.
 */
export const sendContactNotification = async (
  msg: ContactNotice,
): Promise<void> => {
  try {
    const html = layout(
      "New contact inquiry",
      `<p style="margin:0 0 4px;"><strong>From:</strong> ${escapeHtml(msg.name)} &lt;${escapeHtml(msg.email)}&gt;</p>
       <p style="margin:0 0 4px;"><strong>Reason:</strong> ${escapeHtml(msg.reason)}</p>
       <p style="margin:0 0 16px;"><strong>Subject:</strong> ${escapeHtml(msg.subject)}</p>
       <div style="border-left:3px solid #d4af37; padding-left:12px; color:#333; white-space:pre-wrap;">${escapeHtml(msg.message)}</div>`,
    );
    await sendMail({
      to: envConfig.CONTACT_NOTIFY_EMAIL,
      subject: `New inquiry: ${msg.subject}`,
      html,
      replyTo: msg.email,
    });
  } catch (error) {
    console.error("[email] contact notification failed:", error);
  }
};

/** Welcomes a brand-new newsletter subscriber. Best-effort (logs on failure). */
export const sendWelcomeEmail = async (email: string): Promise<void> => {
  try {
    const html = layout(
      "Welcome aboard",
      `<p style="margin:0 0 12px; color:#333;">Thank you for subscribing to Ugo Peters' newsletter.</p>
       <p style="margin:0; color:#333;">You'll receive strategic frameworks and market analysis on the African economic landscape — straight to your inbox.</p>`,
    );
    await sendMail({
      to: email,
      subject: "Welcome to Ugo Peters' newsletter",
      html,
    });
  } catch (error) {
    console.error("[email] welcome email failed:", error);
  }
};

/** Notifies Ugo of a new newsletter signup. Best-effort (logs on failure). */
export const sendSubscriberNotification = async (
  email: string,
): Promise<void> => {
  try {
    const html = layout(
      "New newsletter subscriber",
      `<p style="margin:0; color:#333;"><strong>${escapeHtml(email)}</strong> just joined the newsletter.</p>`,
    );
    await sendMail({
      to: envConfig.CONTACT_NOTIFY_EMAIL,
      subject: "New newsletter subscriber",
      html,
    });
  } catch (error) {
    console.error("[email] subscriber notification failed:", error);
  }
};
