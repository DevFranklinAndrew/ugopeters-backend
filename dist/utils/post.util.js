"use strict";
/**
 * Derived-field helpers for posts, ported from the frontend CMS
 * (frontend/src/admin/pages/PostEditor.tsx) so the server produces the same
 * slug / read-time / excerpt / date values the editor previewed. `stripHtml`
 * is reimplemented without the DOM (no `document` in Node) using a regex.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractImageUrls = exports.parsePublishDate = exports.formatDate = exports.deriveExcerpt = exports.readingTime = exports.stripHtml = exports.slugify = void 0;
const WORDS_PER_MINUTE = 200;
const EXCERPT_LENGTH = 160;
/** Title → URL-friendly, kebab-case slug (matches the CMS `slugify`). */
const slugify = (value) => value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
exports.slugify = slugify;
const HTML_ENTITIES = {
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
const stripHtml = (html) => html
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, (entity) => HTML_ENTITIES[entity] ?? " ")
    .replace(/\s+/g, " ")
    .trim();
exports.stripHtml = stripHtml;
/** Estimated reading time, e.g. "8 min read" (min 1 minute). */
const readingTime = (html) => {
    const words = (0, exports.stripHtml)(html).split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
    return `${minutes} min read`;
};
exports.readingTime = readingTime;
/** First ~160 chars of the plain-text content, with an ellipsis when trimmed. */
const deriveExcerpt = (html) => {
    const text = (0, exports.stripHtml)(html);
    if (text.length <= EXCERPT_LENGTH)
        return text;
    return `${text.slice(0, EXCERPT_LENGTH).trimEnd()}…`;
};
exports.deriveExcerpt = deriveExcerpt;
/** Display date, e.g. "January 28, 2026". */
const formatDate = (date = new Date()) => date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
});
exports.formatDate = formatDate;
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
const parsePublishDate = (value) => {
    const text = value?.trim();
    if (!text)
        return null;
    const isoDay = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
    if (isoDay) {
        const [, year, month, day] = isoDay.map(Number);
        const parsed = new Date(year, month - 1, day, 12, 0, 0, 0);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    const parsed = new Date(text);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};
exports.parsePublishDate = parsePublishDate;
/** Collects the `src` of every `<img>` in a content HTML string. */
const extractImageUrls = (html) => {
    const urls = [];
    const regex = /<img[^>]+src=["']([^"']+)["']/gi;
    let match;
    while ((match = regex.exec(html)) !== null)
        urls.push(match[1]);
    return urls;
};
exports.extractImageUrls = extractImageUrls;
//# sourceMappingURL=post.util.js.map