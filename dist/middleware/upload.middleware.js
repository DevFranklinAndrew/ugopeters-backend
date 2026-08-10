"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSingleImage = void 0;
const multer_1 = __importDefault(require("multer"));
const app_error_1 = __importDefault(require("../errors/app.error"));
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB
/**
 * Buffers a single image in memory (not disk) so the service can stream it
 * straight to Cloudinary. Rejects non-image files up front.
 */
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: MAX_FILE_BYTES },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith("image/"))
            return cb(null, true);
        cb(new app_error_1.default("Only image files are allowed.", 400));
    },
});
const singleImage = upload.single("image");
/**
 * Runs multer for a single `image` field and normalizes its errors into
 * operational AppErrors so the global handler formats them consistently
 * (rather than surfacing a raw MulterError as a 500).
 */
const uploadSingleImage = (req, res, next) => {
    singleImage(req, res, (err) => {
        if (err instanceof multer_1.default.MulterError) {
            const message = err.code === "LIMIT_FILE_SIZE"
                ? "Image must be 5MB or smaller."
                : err.message;
            return next(new app_error_1.default(message, 400));
        }
        if (err)
            return next(err); // AppError from fileFilter, or anything else
        next();
    });
};
exports.uploadSingleImage = uploadSingleImage;
//# sourceMappingURL=upload.middleware.js.map