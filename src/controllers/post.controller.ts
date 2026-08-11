import type { Request, Response } from "express";
import type { PostDocument } from "../models/post.model";
import * as emailService from "../services/email.service";
import * as postService from "../services/post.service";
import { toBoolean, toPositiveInt } from "../utils/query.util";
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
  // The sortable form of `date` — the CMS prefills its date input from this.
  publishedAt: post.publishedAt,
  category: post.category,
  readTime: post.readTime,
  image: post.image,
  featured: post.featured,
  author: post.author,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
});

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

  // Announce the new post to newsletter subscribers. Not awaited: it's a
  // best-effort side effect that must not block or fail the create response
  // (the function catches its own errors internally).
  emailService.sendNewPostNotification(post);

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
