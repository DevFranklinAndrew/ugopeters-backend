"use strict";
/**
 * Derived-field helpers for posts, ported from the frontend CMS
 * (frontend/src/admin/pages/PostEditor.tsx) so the server produces the same
 * slug / read-time / excerpt / date values the editor previewed. `stripHtml`
 * is reimplemented without the DOM (no `document` in Node) using a regex.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractImageUrls = exports.isValidDateInput = exports.parseDateInput = exports.formatDate = exports.deriveExcerpt = exports.readingTime = exports.stripHtml = exports.slugify = void 0;
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
 * Parses the CMS date input (`yyyy-mm-dd`) into a Date.
 *
 * Built from local parts at midday rather than `new Date("2026-08-10")`, which
 * the spec parses as UTC midnight — in any negative-offset timezone that lands
 * on the previous calendar day, so a post dated the 10th would display as the
 * 9th. Midday keeps the same date for every real-world offset.
 */
const parseDateInput = (value) => {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day, 12, 0, 0, 0);
};
exports.parseDateInput = parseDateInput;
/** True when `yyyy-mm-dd` is a real calendar date (rejects e.g. 2026-02-31). */
const isValidDateInput = (value) => {
    const [year, month, day] = value.split("-").map(Number);
    const parsed = (0, exports.parseDateInput)(value);
    return (parsed.getFullYear() === year &&
        parsed.getMonth() === month - 1 &&
        parsed.getDate() === day);
};
exports.isValidDateInput = isValidDateInput;
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