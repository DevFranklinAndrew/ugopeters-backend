import type { Request, Response } from "express";
import type { PostDocument } from "../models/post.model";
import * as postService from "../services/post.service";
import {
  validateCreatePost,
  validateUpdatePost,
} from "../validations/post.validation";

/** Shapes a post document into the API payload (exposes `_id` as `id`). */
const toPublicPost = (post: PostDocument) => ({
  id: post.id as string,
  slug: post.slug,
  title: post.title,
  excerpt: post.excerpt,
  content: post.content,
  date: post.date,
  category: post.category,
  readTime: post.readTime,
  image: post.image,
  featured: post.featured,
  author: post.author,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
});

/** Parses a query value into a positive integer, or undefined when absent/invalid. */
const toPositiveInt = (value: unknown): number | undefined => {
  if (typeof value !== "string") return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

/** Parses a query value into a boolean ("true"/"false"), or undefined otherwise. */
const toBoolean = (value: unknown): boolean | undefined => {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
};

const listPosts = async (req: Request, res: Response): Promise<void> => {
  const { category, search } = req.query;

  const { posts, pagination } = await postService.listPosts({
    page: toPositiveInt(req.query.page),
    limit: toPositiveInt(req.query.limit),
    category: typeof category === "string" ? category : undefined,
    search: typeof search === "string" ? search : undefined,
    featured: toBoolean(req.query.featured),
  });

  res.status(200).json({
    status: "success",
    data: { posts: posts.map(toPublicPost), pagination },
  });
};

const getPost = async (req: Request, res: Response): Promise<void> => {
  const post = await postService.getPostBySlug(String(req.params.slug));
  res.status(200).json({
    status: "success",
    data: { post: toPublicPost(post) },
  });
};

const createPost = async (req: Request, res: Response): Promise<void> => {
  const input = validateCreatePost(req.body);
  const post = await postService.createPost(input);
  res.status(201).json({
    status: "success",
    data: { post: toPublicPost(post) },
  });
};

const updatePost = async (req: Request, res: Response): Promise<void> => {
  const input = validateUpdatePost(req.body);
  const post = await postService.updatePost(String(req.params.id), input);
  res.status(200).json({
    status: "success",
    data: { post: toPublicPost(post) },
  });
};

const deletePost = async (req: Request, res: Response): Promise<void> => {
  await postService.deletePost(String(req.params.id));
  res.status(200).json({ status: "success", message: "Post deleted." });
};

export { listPosts, getPost, createPost, updatePost, deletePost };
