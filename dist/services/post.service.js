"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.updatePost = exports.createPost = exports.getPostBySlug = exports.listPosts = void 0;
const app_error_1 = __importDefault(require("../errors/app.error"));
const post_model_1 = __importDefault(require("../models/post.model"));
const post_util_1 = require("../utils/post.util");
const upload_service_1 = require("./upload.service");
/** All image URLs a post references: its cover plus any inline content images. */
const imageUrlsOf = (post) => [
    post.image,
    ...(0, post_util_1.extractImageUrls)(post.content),
];
/**
 * Generates a unique, kebab-case slug from a title. On collision it appends
 * `-2`, `-3`, … `excludeId` lets an update keep its own slug when the title is
 * unchanged (so it doesn't collide with itself).
 */
const generateUniqueSlug = async (title, excludeId) => {
    const base = (0, post_util_1.slugify)(title);
    let slug = base;
    let suffix = 2;
    // Loop until we find a slug not held by a *different* document.
    while (true) {
        const clash = await post_model_1.default.findOne({ slug }).select("_id");
        if (!clash || clash.id === excludeId)
            return slug;
        slug = `${base}-${suffix}`;
        suffix += 1;
    }
};
/** Paginated, filterable list of posts, newest first. */
const listPosts = async (query) => {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.max(1, query.limit ?? 6);
    const skip = (page - 1) * limit;
    const filter = {};
    if (query.category)
        filter.category = query.category;
    if (typeof query.featured === "boolean")
        filter.featured = query.featured;
    if (query.search) {
        const term = new RegExp(query.search, "i");
        filter.$or = [{ title: term }, { excerpt: term }, { category: term }];
    }
    const [posts, total] = await Promise.all([
        // Sort on the publish date so back-dated manual uploads slot into the right
        // place chronologically, not wherever they happened to be entered.
        // `createdAt` breaks ties (and orders any legacy row without publishedAt).
        post_model_1.default.find(filter)
            .sort({ publishedAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit),
        post_model_1.default.countDocuments(filter),
    ]);
    return {
        posts,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
};
exports.listPosts = listPosts;
/** Single post by slug (for the public BlogDetail page). 404 if missing. */
const getPostBySlug = async (slug) => {
    const post = await post_model_1.default.findOne({ slug });
    if (!post)
        throw new app_error_1.default("Post not found.", 404);
    return post;
};
exports.getPostBySlug = getPostBySlug;
/**
 * Creates a post, deriving slug / excerpt / readTime server-side. `date` comes
 * from the CMS when supplied (so older articles can be back-dated), otherwise
 * it defaults to today. Both the sortable `publishedAt` and its display string
 * are written from the same instant so they can never disagree.
 */
const createPost = async (input) => {
    const slug = await generateUniqueSlug(input.title);
    const publishedAt = input.date ? (0, post_util_1.parseDateInput)(input.date) : new Date();
    return post_model_1.default.create({
        title: input.title,
        content: input.content,
        category: input.category,
        image: input.image,
        featured: input.featured ?? false,
        excerpt: input.excerpt?.trim() || (0, post_util_1.deriveExcerpt)(input.content),
        slug,
        readTime: (0, post_util_1.readingTime)(input.content),
        publishedAt,
        date: (0, post_util_1.formatDate)(publishedAt),
    });
};
exports.createPost = createPost;
/**
 * Partially updates a post by id. Regenerates the slug when the title changes,
 * recomputes readTime when content changes, and re-derives a blank excerpt.
 * The publish date is only touched when `date` is supplied, so an edit that
 * omits it leaves the original date alone. 404 if the post doesn't exist.
 */
const updatePost = async (id, input) => {
    const post = await getPostById(id);
    const oldUrls = imageUrlsOf(post);
    if (input.title !== undefined && input.title !== post.title) {
        post.title = input.title;
        post.slug = await generateUniqueSlug(input.title, post.id);
    }
    if (input.content !== undefined) {
        post.content = input.content;
        post.readTime = (0, post_util_1.readingTime)(input.content);
    }
    if (input.category !== undefined)
        post.category = input.category;
    if (input.image !== undefined)
        post.image = input.image;
    if (input.featured !== undefined)
        post.featured = input.featured;
    if (input.date !== undefined) {
        post.publishedAt = (0, post_util_1.parseDateInput)(input.date);
        post.date = (0, post_util_1.formatDate)(post.publishedAt);
    }
    // Use the provided excerpt, else re-derive from the (possibly new) content.
    if (input.excerpt !== undefined) {
        post.excerpt = input.excerpt.trim() || (0, post_util_1.deriveExcerpt)(post.content);
    }
    await post.save();
    // Clean up Cloudinary assets no longer referenced after the update.
    const newUrls = new Set(imageUrlsOf(post));
    await (0, upload_service_1.deleteImages)(oldUrls.filter((url) => !newUrls.has(url)));
    return post;
};
exports.updatePost = updatePost;
/** Deletes a post by id, plus its Cloudinary images. 404 if missing. */
const deletePost = async (id) => {
    const post = await getPostById(id);
    const urls = imageUrlsOf(post);
    await post.deleteOne();
    await (0, upload_service_1.deleteImages)(urls);
};
exports.deletePost = deletePost;
/** Loads a post by Mongo `_id`; throws 404 (CastErrors are handled globally). */
const getPostById = async (id) => {
    const post = await post_model_1.default.findById(id);
    if (!post)
        throw new app_error_1.default("Post not found.", 404);
    return post;
};
//# sourceMappingURL=post.service.js.map