import AppError from "../errors/app.error";
import Post, { type PostDocument } from "../models/post.model";
import type {
  CreatePostInput,
  UpdatePostInput,
} from "../validations/post.validation";
import {
  deriveExcerpt,
  extractImageUrls,
  formatDate,
  parsePublishDate,
  readingTime,
  slugify,
} from "../utils/post.util";
import { deleteImages } from "./upload.service";

/** All image URLs a post references: its cover plus any inline content images. */
const imageUrlsOf = (post: PostDocument): string[] => [
  post.image,
  ...extractImageUrls(post.content),
];

export interface ListPostsQuery {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  featured?: boolean;
}

export interface ListPostsResult {
  posts: PostDocument[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Generates a unique, kebab-case slug from a title. On collision it appends
 * `-2`, `-3`, … `excludeId` lets an update keep its own slug when the title is
 * unchanged (so it doesn't collide with itself).
 */
const generateUniqueSlug = async (
  title: string,
  excludeId?: string,
): Promise<string> => {
  const base = slugify(title);
  let slug = base;
  let suffix = 2;

  // Loop until we find a slug not held by a *different* document.
  while (true) {
    const clash = await Post.findOne({ slug }).select("_id");
    if (!clash || clash.id === excludeId) return slug;
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
};

/** Paginated, filterable list of posts, newest first. */
const listPosts = async (query: ListPostsQuery): Promise<ListPostsResult> => {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.max(1, query.limit ?? 6);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (query.category) filter.category = query.category;
  if (typeof query.featured === "boolean") filter.featured = query.featured;
  if (query.search) {
    const term = new RegExp(query.search, "i");
    filter.$or = [{ title: term }, { excerpt: term }, { category: term }];
  }

  const [posts, total] = await Promise.all([
    // Sort on the publish date so back-dated manual uploads slot into the right
    // place chronologically, not wherever they happened to be entered.
    // `createdAt` breaks ties (and orders any legacy row without publishedAt).
    Post.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Post.countDocuments(filter),
  ]);

  return {
    posts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

/** Single post by slug (for the public BlogDetail page). 404 if missing. */
const getPostBySlug = async (slug: string): Promise<PostDocument> => {
  const post = await Post.findOne({ slug });
  if (!post) throw new AppError("Post not found.", 404);
  return post;
};

/**
 * Creates a post, deriving slug / excerpt / readTime server-side.
 *
 * `date` is free text from the CMS (so older articles can be back-dated) and is
 * stored exactly as typed — it is the string readers see. `publishedAt` is a
 * best-effort parse of it, used only for ordering; text that isn't a date falls
 * back to now, which keeps the post saveable and simply sorts it as current.
 */
const createPost = async (input: CreatePostInput): Promise<PostDocument> => {
  const slug = await generateUniqueSlug(input.title);
  const date = input.date?.trim() || formatDate();

  return Post.create({
    title: input.title,
    content: input.content,
    category: input.category,
    image: input.image,
    featured: input.featured ?? false,
    excerpt: input.excerpt?.trim() || deriveExcerpt(input.content),
    slug,
    readTime: readingTime(input.content),
    date,
    publishedAt: parsePublishDate(date) ?? new Date(),
  });
};

/**
 * Partially updates a post by id. Regenerates the slug when the title changes,
 * recomputes readTime when content changes, and re-derives a blank excerpt.
 * The publish date is only touched when `date` is supplied, so an edit that
 * omits it leaves the original date alone. 404 if the post doesn't exist.
 */
const updatePost = async (
  id: string,
  input: UpdatePostInput,
): Promise<PostDocument> => {
  const post = await getPostById(id);
  const oldUrls = imageUrlsOf(post);

  if (input.title !== undefined && input.title !== post.title) {
    post.title = input.title;
    post.slug = await generateUniqueSlug(input.title, post.id);
  }

  if (input.content !== undefined) {
    post.content = input.content;
    post.readTime = readingTime(input.content);
  }

  if (input.category !== undefined) post.category = input.category;
  if (input.image !== undefined) post.image = input.image;
  if (input.featured !== undefined) post.featured = input.featured;

  if (input.date !== undefined) {
    post.date = input.date.trim();
    post.publishedAt = parsePublishDate(post.date) ?? post.publishedAt;
  }

  // Use the provided excerpt, else re-derive from the (possibly new) content.
  if (input.excerpt !== undefined) {
    post.excerpt = input.excerpt.trim() || deriveExcerpt(post.content);
  }

  await post.save();

  // Clean up Cloudinary assets no longer referenced after the update.
  const newUrls = new Set(imageUrlsOf(post));
  await deleteImages(oldUrls.filter((url) => !newUrls.has(url)));

  return post;
};

/** Deletes a post by id, plus its Cloudinary images. 404 if missing. */
const deletePost = async (id: string): Promise<void> => {
  const post = await getPostById(id);
  const urls = imageUrlsOf(post);
  await post.deleteOne();
  await deleteImages(urls);
};

/** Loads a post by Mongo `_id`; throws 404 (CastErrors are handled globally). */
const getPostById = async (id: string): Promise<PostDocument> => {
  const post = await Post.findById(id);
  if (!post) throw new AppError("Post not found.", 404);
  return post;
};

export {
  listPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
};
