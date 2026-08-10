"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImages = exports.publicIdFromUrl = exports.uploadImage = void 0;
const stream_1 = require("stream");
const cloudinary_configuration_1 = __importDefault(require("../configurations/cloudinary.configuration"));
const env_configuration_1 = __importDefault(require("../configurations/env.configuration"));
const app_error_1 = __importDefault(require("../errors/app.error"));
/**
 * Streams an in-memory image buffer to Cloudinary and returns its hosted URL.
 * Large images are capped at 2000px wide (aspect preserved) to keep delivery
 * light. `publicId` is returned so a future step can delete orphaned assets.
 */
const uploadImage = (buffer) => new Promise((resolve, reject) => {
    const stream = cloudinary_configuration_1.default.uploader.upload_stream({
        folder: env_configuration_1.default.CLOUDINARY_FOLDER,
        resource_type: "image",
        transformation: [{ width: 2000, crop: "limit" }],
    }, (error, result) => {
        if (error || !result) {
            // Log the real Cloudinary error server-side; return a clean message.
            console.error("[upload] Cloudinary error:", error);
            return reject(new app_error_1.default("Image upload failed. Please try again.", 502));
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
    });
    stream_1.Readable.from(buffer).pipe(stream);
});
exports.uploadImage = uploadImage;
/**
 * Recovers a Cloudinary `publicId` (incl. folder) from one of its delivery
 * URLs, so assets can be deleted without persisting the id separately. Strips
 * any transformation segments and the `v<version>/` prefix, then the extension.
 * Returns null for anything that isn't a Cloudinary-hosted URL.
 *
 *   https://res.cloudinary.com/x/image/upload/c_limit,w_2000/v17/ugopeters/blog/abc.png
 *     → "ugopeters/blog/abc"
 */
const publicIdFromUrl = (url) => {
    if (!url.includes("res.cloudinary.com"))
        return null;
    const afterUpload = url.split("/upload/")[1];
    if (!afterUpload)
        return null;
    // Drop leading transformation segments + the version segment (v123/).
    const withoutVersion = afterUpload.replace(/^(?:[^/]+\/)*?v\d+\//, "");
    const publicId = withoutVersion.replace(/\.[^./]+$/, "");
    return publicId || null;
};
exports.publicIdFromUrl = publicIdFromUrl;
/**
 * Best-effort deletion of Cloudinary assets by their URLs. Non-Cloudinary URLs
 * are ignored; individual failures are logged but never thrown — cleanup must
 * not fail the post operation that triggered it.
 */
const deleteImages = async (urls) => {
    const publicIds = urls
        .map(publicIdFromUrl)
        .filter((id) => id !== null);
    const results = await Promise.allSettled(publicIds.map((publicId) => cloudinary_configuration_1.default.uploader.destroy(publicId)));
    results.forEach((result, i) => {
        if (result.status === "rejected") {
            console.error(`[upload] Failed to delete ${publicIds[i]}:`, result.reason);
        }
    });
};
exports.deleteImages = deleteImages;
//# sourceMappingURL=upload.service.js.map