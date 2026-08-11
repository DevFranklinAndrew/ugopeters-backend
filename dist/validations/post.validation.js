"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePostSchema = exports.createPostSchema = exports.validateUpdatePost = exports.validateCreatePost = void 0;
const zod_1 = require("zod");
const app_error_1 = __importDefault(require("../errors/app.error"));
const post_util_1 = require("../utils/post.util");
/**
 * Client-supplied fields for a post. The server owns the derived fields
 * (`slug`, `readTime`) and fills `excerpt` from `content` when blank, so those
 * are NOT accepted here. `date` IS accepted so the CMS can back-date manual
 * uploads; omitted, it defaults to today.
 */
const createPostSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(1, "Title is required."),
    content: zod_1.z.string().trim().min(1, "Content is required."),
    category: zod_1.z.string().trim().min(1, "Category is required."),
    image: zod_1.z.string().trim().min(1, "Image is required."),
    excerpt: zod_1.z.string().trim().optional(),
    featured: zod_1.z.boolean().optional(),
    // `yyyy-mm-dd`, as emitted by <input type="date">.
    date: zod_1.z
        .string()
        .trim()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in yyyy-mm-dd format.")
        .refine(post_util_1.isValidDateInput, "That date does not exist.")
        .optional(),
});
exports.createPostSchema = createPostSchema;
// Every field optional for a partial update, but reject an empty payload.
const updatePostSchema = createPostSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update.",
});
exports.updatePostSchema = updatePostSchema;
const formatIssues = (error) => error.issues.map((issue) => issue.message).join(". ");
/** Validate a create payload; zod failures become an operational AppError (422). */
const validateCreatePost = (payload) => {
    const result = createPostSchema.safeParse(payload);
    if (!result.success)
        throw new app_error_1.default(formatIssues(result.error), 422);
    return result.data;
};
exports.validateCreatePost = validateCreatePost;
/** Validate a partial update payload; zod failures become an AppError (422). */
const validateUpdatePost = (payload) => {
    const result = updatePostSchema.safeParse(payload);
    if (!result.success)
        throw new app_error_1.default(formatIssues(result.error), 422);
    return result.data;
};
exports.validateUpdatePost = validateUpdatePost;
//# sourceMappingURL=post.validation.js.map