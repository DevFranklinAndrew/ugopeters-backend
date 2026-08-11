"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const postSchema = new mongoose_1.Schema({
    slug: {
        type: String,
        required: [true, "Slug is required."],
        unique: true,
        trim: true,
    },
    title: {
        type: String,
        required: [true, "Title is required."],
        trim: true,
    },
    excerpt: {
        type: String,
        required: [true, "Excerpt is required."],
        trim: true,
    },
    content: {
        type: String,
        required: [true, "Content is required."],
    },
    date: {
        type: String,
        required: [true, "Date is required."],
    },
    // Indexed because every list query sorts on it.
    publishedAt: {
        type: Date,
        default: Date.now,
        index: true,
    },
    category: {
        type: String,
        required: [true, "Category is required."],
        trim: true,
    },
    readTime: {
        type: String,
        required: [true, "Read time is required."],
    },
    image: {
        type: String,
        required: [true, "Image is required."],
    },
    featured: {
        type: Boolean,
        default: false,
    },
    author: {
        type: String,
        default: "Ugo Peters",
        trim: true,
    },
}, { timestamps: true });
const Post = (0, mongoose_1.model)("Post", postSchema);
exports.default = Post;
//# sourceMappingURL=post.model.js.map