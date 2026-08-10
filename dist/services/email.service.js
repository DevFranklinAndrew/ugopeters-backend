"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNewPostNotification = exports.sendSubscriberNotification = exports.sendWelcomeEmail = exports.sendContactNotification = void 0;
const email_configuration_1 = require("../configurations/email.configuration");
const env_configuration_1 = __importDefault(require("../configurations/env.configuration"));
const subscriberService = __importStar(require("./subscriber.service"));
/** Escapes user-supplied text so it can't inject markup into the email HTML. */
const escapeHtml = (value) => value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
/** Escapes text and preserves its line breaks as <br> (for email bodies). */
const nl2br = (value) => escapeHtml(value).replace(/\n/g, "<br />");
const GOLD = "#d4af37";
// Brand fonts (mirrors the site) with web-safe fallbacks for clients — e.g.
// Gmail — that strip webfonts. Serif for headings, sans for body/UI.
const FONT_SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
const FONT_SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
/**
 * A "bulletproof" CTA button — a table wrapper with an inline-styled anchor, so
 * it renders consistently across email clients (including Outlook).
 */
const button = (href, label) => `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 4px 0;">
    <tr>
      <td align="center" bgcolor="${GOLD}" style="border-radius: 2px;">
        <a href="${href}" target="_blank" style="display: inline-block; padding: 14px 34px; font-family: ${FONT_SANS}; font-size: 13px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; color: #000000; text-decoration: none;">${label}</a>
      </td>
    </tr>
  </table>`;
/**
 * Wraps body HTML in a responsive, email-client-safe layout: a centered white
 * card on a light background, a gold accent bar, a serif brand + heading, and a
 * muted footer. Table-based and fully inline-styled for maximum compatibility.
 */
const layout = (heading, bodyHtml) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Inter:wght@400;500;600&display=swap');
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f5;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5;">
        <tr>
          <td align="center" style="padding: 32px 16px;">
            <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width: 600px; max-width: 100%; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 4px; overflow: hidden;">
              <tr>
                <td style="height: 4px; line-height: 4px; font-size: 0; background-color: ${GOLD};">&nbsp;</td>
              </tr>
              <tr>
                <td style="padding: 30px 40px 0;">
                  <span style="font-family: ${FONT_SERIF}; font-size: 22px; font-weight: bold; color: #111111;">Ugo Peters<span style="color: ${GOLD};">.</span></span>
                </td>
              </tr>
              <tr>
                <td style="padding: 18px 40px 0;">
                  <h1 style="margin: 0; font-family: ${FONT_SERIF}; font-size: 24px; line-height: 1.3; font-weight: bold; color: #111111;">${heading}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 16px 40px 32px; font-family: ${FONT_SANS}; font-size: 15px; line-height: 1.6; color: #3f3f46;">
                  ${bodyHtml}
                </td>
              </tr>
              <tr>
                <td style="padding: 0 40px;">
                  <div style="border-top: 1px solid #e4e4e7;"></div>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 40px 30px; font-family: ${FONT_SANS}; font-size: 12px; line-height: 1.6; color: #a1a1aa;">
                  Ugo Peters — real estate strategy, ventures &amp; executive mentorship.<br />
                  <a href="${env_configuration_1.default.CLIENT_URL}" target="_blank" style="color: ${GOLD}; text-decoration: none;">ugopeters.com</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
/**
 * Low-level send. Tries Resend, then SMTP; when neither is configured it logs a
 * skip and returns (email is optional — the request that triggered it already
 * succeeded). Throws only when a configured provider actually fails to send.
 */
const sendMail = async ({ to, subject, html, replyTo, }) => {
    if (email_configuration_1.resendClient) {
        const { error } = await email_configuration_1.resendClient.emails.send({
            from: env_configuration_1.default.EMAIL_FROM,
            to,
            subject,
            html,
            replyTo,
        });
        if (error)
            throw new Error(error.message);
        return;
    }
    if (email_configuration_1.smtpTransporter) {
        await email_configuration_1.smtpTransporter.sendMail({
            from: env_configuration_1.default.EMAIL_FROM,
            to,
            subject,
            html,
            replyTo,
        });
        return;
    }
    console.warn("[email] skipped — no provider configured (set RESEND_API_KEY or SMTP_*).");
};
/** A labelled row used in the contact-notification detail table. */
const detailRow = (label, value) => `
  <tr>
    <td style="padding: 5px 0; width: 84px; color: #71717a; vertical-align: top;">${label}</td>
    <td style="padding: 5px 0; color: #111111;">${value}</td>
  </tr>`;
/**
 * Notifies Ugo of a new contact-form submission. Best-effort: any failure is
 * logged and swallowed so the caller can fire it and forget.
 */
const sendContactNotification = async (msg) => {
    try {
        const html = layout("New contact inquiry", `<p style="margin: 0 0 18px;">You've received a new inquiry through the website.</p>
       <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; font-size: 14px;">
         ${detailRow("From", `${escapeHtml(msg.name)} &lt;${escapeHtml(msg.email)}&gt;`)}
         ${detailRow("Reason", escapeHtml(msg.reason))}
         ${detailRow("Subject", escapeHtml(msg.subject))}
       </table>
       <div style="margin-top: 18px; padding: 16px 20px; background-color: #faf9f5; border-left: 3px solid ${GOLD}; color: #3f3f46;">${nl2br(msg.message)}</div>`);
        await sendMail({
            to: env_configuration_1.default.CONTACT_NOTIFY_EMAIL,
            subject: `New inquiry: ${msg.subject}`,
            html,
            replyTo: msg.email,
        });
    }
    catch (error) {
        console.error("[email] contact notification failed:", error);
    }
};
exports.sendContactNotification = sendContactNotification;
/** Welcomes a brand-new newsletter subscriber. Best-effort (logs on failure). */
const sendWelcomeEmail = async (email) => {
    try {
        const html = layout("Welcome aboard", `<p style="margin: 0 0 16px;">Thank you for subscribing to Ugo Peters' newsletter.</p>
       <p style="margin: 0 0 24px;">You'll receive strategic frameworks and market analysis on the African economic landscape — straight to your inbox.</p>
       ${button(`${env_configuration_1.default.CLIENT_URL}/blog`, "Explore the blog")}`);
        await sendMail({
            to: email,
            subject: "Welcome to Ugo Peters' newsletter",
            html,
        });
    }
    catch (error) {
        console.error("[email] welcome email failed:", error);
    }
};
exports.sendWelcomeEmail = sendWelcomeEmail;
/** Notifies Ugo of a new newsletter signup. Best-effort (logs on failure). */
const sendSubscriberNotification = async (email) => {
    try {
        const html = layout("New newsletter subscriber", `<p style="margin: 0 0 6px; font-size: 17px; color: #111111;"><strong>${escapeHtml(email)}</strong></p>
       <p style="margin: 0; color: #71717a;">just joined your newsletter.</p>`);
        await sendMail({
            to: env_configuration_1.default.CONTACT_NOTIFY_EMAIL,
            subject: "New newsletter subscriber",
            html,
        });
    }
    catch (error) {
        console.error("[email] subscriber notification failed:", error);
    }
};
exports.sendSubscriberNotification = sendSubscriberNotification;
/**
 * Emails every newsletter subscriber about a newly published post. Best-effort:
 * sends individually (one recipient per email, so addresses stay private),
 * sequentially (to respect provider rate limits), and logs — never throws — so
 * the caller can fire it and forget. Skips entirely when no provider is
 * configured or there are no subscribers.
 */
const sendNewPostNotification = async (post) => {
    if (!email_configuration_1.resendClient && !email_configuration_1.smtpTransporter) {
        console.warn("[email] post broadcast skipped — no provider configured.");
        return;
    }
    let emails;
    try {
        emails = await subscriberService.getAllEmails();
    }
    catch (error) {
        console.error("[email] post broadcast: failed to load subscribers:", error);
        return;
    }
    if (emails.length === 0)
        return;
    const url = `${env_configuration_1.default.CLIENT_URL}/blog/${post.slug}`;
    const html = layout("New from Ugo Peters", `<p style="margin: 0 0 6px; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; color: #a1a1aa;">New article</p>
     <h2 style="margin: 0 0 14px; font-family: ${FONT_SERIF}; font-size: 21px; line-height: 1.3; color: #111111;">${escapeHtml(post.title)}</h2>
     <p style="margin: 0 0 26px; color: #3f3f46;">${escapeHtml(post.excerpt)}</p>
     ${button(url, "Read the article")}
     <p style="margin: 26px 0 0; font-size: 12px; color: #a1a1aa;">You're receiving this because you subscribed to Ugo Peters' newsletter.</p>`);
    const subject = `New article: ${post.title}`;
    let sent = 0;
    for (const to of emails) {
        try {
            await sendMail({ to, subject, html });
            sent += 1;
        }
        catch (error) {
            console.error(`[email] post notification to ${to} failed:`, error);
        }
    }
    console.log(`[email] post "${post.title}" — notified ${sent}/${emails.length} subscribers.`);
};
exports.sendNewPostNotification = sendNewPostNotification;
//# sourceMappingURL=email.service.js.map