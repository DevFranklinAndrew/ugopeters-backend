import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import AppError from "../errors/app.error";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Buffers a single image in memory (not disk) so the service can stream it
 * straight to Cloudinary. Rejects non-image files up front.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) return cb(null, true);
    cb(new AppError("Only image files are allowed.", 400));
  },
});

const singleImage = upload.single("image");

/**
 * Runs multer for a single `image` field and normalizes its errors into
 * operational AppErrors so the global handler formats them consistently
 * (rather than surfacing a raw MulterError as a 500).
 */
export const uploadSingleImage = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  singleImage(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "Image must be 5MB or smaller."
          : err.message;
      return next(new AppError(message, 400));
    }
    if (err) return next(err); // AppError from fileFilter, or anything else
    next();
  });
};
