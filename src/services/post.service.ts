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

/** Unique slug from a title, appending `-2`, `-3`, … on collision. `excludeId`
 *  lets an update keep its own slug instead of colliding with itself. */
const generateUniqueSlug = async (
  title: string,
  excludeId?: string,
): Promise<string> => {
  const base = slugify(title);
  let slug = base;
  let suffix = 2;

  while (true) {
    const clash = await Post.findOne({ slug }).select("_id");
    if (!clash || clash.id === excludeId) return slug;
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
};

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
    // publishedAt, not createdAt, so back-dated posts slot in chronologically;
    // createdAt only breaks ties.
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

const getPostBySlug = async (slug: string): Promise<PostDocument> => {
  const post = await Post.findOne({ slug });
  if (!post) throw new AppError("Post not found.", 404);
  return post;
};

/**
 * Creates a post, deriving slug / excerpt / readTime server-side. `date` is
 * free text stored verbatim (it's what readers see); `publishedAt` is a
 * best-effort parse of it for ordering, falling back to now when unparseable.
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

/** Partial update; only supplied fields are touched, so an edit that omits
 *  `date` leaves the original publish date alone. */
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

  if (input.excerpt !== undefined) {
    post.excerpt = input.excerpt.trim() || deriveExcerpt(post.content);
  }

  await post.save();

  // Drop Cloudinary assets the update left unreferenced.
  const newUrls = new Set(imageUrlsOf(post));
  await deleteImages(oldUrls.filter((url) => !newUrls.has(url)));

  return post;
};

const deletePost = async (id: string): Promise<void> => {
  const post = await getPostById(id);
  const urls = imageUrlsOf(post);
  await post.deleteOne();
  await deleteImages(urls);
};

/** Malformed ids throw a CastError, which the global handler maps to 400. */
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
