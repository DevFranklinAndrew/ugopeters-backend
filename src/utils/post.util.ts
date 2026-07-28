/**
 * Derived-field helpers for posts, ported from the frontend CMS
 * (frontend/src/admin/pages/PostEditor.tsx) so the server produces the same
 * slug / read-time / excerpt / date values the editor previewed. `stripHtml`
 * is reimplemented without the DOM (no `document` in Node) using a regex.
 */

const WORDS_PER_MINUTE = 200;
const EXCERPT_LENGTH = 160;

/** Title → URL-friendly, kebab-case slug (matches the CMS `slugify`). */
export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const HTML_ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&rsquo;": "’",
  "&lsquo;": "‘",
  "&ldquo;": "“",
  "&rdquo;": "”",
};

/** Strip HTML tags and decode common entities, then collapse whitespace. */
export const stripHtml = (html: string): string =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, (entity) => HTML_ENTITIES[entity] ?? " ")
    .replace(/\s+/g, " ")
    .trim();

/** Estimated reading time, e.g. "8 min read" (min 1 minute). */
export const readingTime = (html: string): string => {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  return `${minutes} min read`;
};

/** First ~160 chars of the plain-text content, with an ellipsis when trimmed. */
export const deriveExcerpt = (html: string): string => {
  const text = stripHtml(html);
  if (text.length <= EXCERPT_LENGTH) return text;
  return `${text.slice(0, EXCERPT_LENGTH).trimEnd()}…`;
};

/** Display date, e.g. "January 28, 2026". */
export const formatDate = (date = new Date()): string =>
  date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
