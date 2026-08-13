/**
 * Derived-field helpers for posts. These mirror the CMS editor's own versions,
 * so the server produces the values the author previewed — keep them in sync.
 * `stripHtml` uses a regex rather than the DOM, since Node has no `document`.
 */

const WORDS_PER_MINUTE = 200;
const EXCERPT_LENGTH = 160;

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

export const stripHtml = (html: string): string =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, (entity) => HTML_ENTITIES[entity] ?? " ")
    .replace(/\s+/g, " ")
    .trim();

/** e.g. "8 min read". */
export const readingTime = (html: string): string => {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  return `${minutes} min read`;
};

export const deriveExcerpt = (html: string): string => {
  const text = stripHtml(html);
  if (text.length <= EXCERPT_LENGTH) return text;
  return `${text.slice(0, EXCERPT_LENGTH).trimEnd()}…`;
};

/** e.g. "January 28, 2026". */
export const formatDate = (date = new Date()): string =>
  date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

/**
 * Free-text publish date → sortable Date, used only for ordering. Unparseable
 * text ("Coming soon") returns null and the caller falls back, so an odd date
 * never blocks saving a post.
 *
 * `yyyy-mm-dd` is handled separately because the spec parses it as UTC
 * midnight, which lands on the previous day in a negative-offset timezone.
 * Building it from local parts at midday keeps the intended day.
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

export const extractImageUrls = (html: string): string[] => {
  const urls: string[] = [];
  const regex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) urls.push(match[1]);
  return urls;
};
