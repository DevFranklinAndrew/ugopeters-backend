import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as uploadController from "../controllers/upload.controller";
import { protect } from "../middleware/auth.middleware";
import { uploadSingleImage } from "../middleware/upload.middleware";

const router = Router();

// Loose: authenticated uploads only need a backstop against runaway clients.
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many uploads. Please try again later.",
  },
});

// multipart/form-data, field name "image".
router.post(
  "/",
  protect,
  uploadLimiter,
  uploadSingleImage,
  uploadController.uploadImage,
);

export default router;
