"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.updatePost = exports.createPost = exports.getPost = exports.listPosts = void 0;
const emailService = __importStar(require("../services/email.service"));
const postService = __importStar(require("../services/post.service"));
const query_util_1 = require("../utils/query.util");
const post_validation_1 = require("../validations/post.validation");
/** Shapes a post document into the API payload (exposes `_id` as `id`). */
const toPublicPost = (post) => ({
    id: post.id,
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
const listPosts = async (req, res) => {
    const { category, search } = req.query;
    const { posts, pagination } = await postService.listPosts({
        page: (0, query_util_1.toPositiveInt)(req.query.page),
        limit: (0, query_util_1.toPositiveInt)(req.query.limit),
        category: typeof category === "string" ? category : undefined,
        search: typeof search === "string" ? search : undefined,
        featured: (0, query_util_1.toBoolean)(req.query.featured),
    });
    res.status(200).json({
        status: "success",
        data: { posts: posts.map(toPublicPost), pagination },
    });
};
exports.listPosts = listPosts;
const getPost = async (req, res) => {
    const post = await postService.getPostBySlug(String(req.params.slug));
    res.status(200).json({
        status: "success",
        data: { post: toPublicPost(post) },
    });
};
exports.getPost = getPost;
const createPost = async (req, res) => {
    const input = (0, post_validation_1.validateCreatePost)(req.body);
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
exports.createPost = createPost;
const updatePost = async (req, res) => {
    const input = (0, post_validation_1.validateUpdatePost)(req.body);
    const post = await postService.updatePost(String(req.params.id), input);
    res.status(200).json({
        status: "success",
        data: { post: toPublicPost(post) },
    });
};
exports.updatePost = updatePost;
const deletePost = async (req, res) => {
    await postService.deletePost(String(req.params.id));
    res.status(200).json({ status: "success", message: "Post deleted." });
};
exports.deletePost = deletePost;
//# sourceMappingURL=post.controller.js.map