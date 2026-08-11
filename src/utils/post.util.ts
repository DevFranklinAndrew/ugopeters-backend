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

/**
 * Best-effort parse of the free-text publish date into a sortable Date.
 *
 * The CMS date is plain text so the author controls exactly how it reads, and
 * that string is what gets displayed verbatim. This is only used to derive
 * `publishedAt` for ordering, so anything unparseable ("Coming soon") returns
 * null and the caller falls back — a date that reads oddly should never block
 * saving a post.
 *
 * A bare `yyyy-mm-dd` is handled separately: the spec parses it as UTC
 * midnight, which in a negative-offset timezone lands on the previous calendar
 * day. Building it from local parts at midday keeps the intended day.
 */
export const parsePublishDate = (value?: string): Date | null => {
  const text = value?.trim();
  if (!text) return null;

  const isoDay = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (isoDay) {
    const [, year, month, day] = isoDay.map(Number);
    const parsed = new Date(year, month - 1, day, 12, 0, 0, 0);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/** Collects the `src` of every `<img>` in a content HTML string. */
export const extractImageUrls = (html: string): string[] => {
  const urls: string[] = [];
  const regex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) urls.push(match[1]);
  return urls;
};
