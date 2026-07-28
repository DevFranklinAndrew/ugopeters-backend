import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as postController from "../controllers/post.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// Light throttle on authenticated writes as a backstop against runaway clients.
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many requests. Please try again later.",
  },
});

// Public reads.
router.get("/", postController.listPosts);
router.get("/:slug", postController.getPost);

// Admin-only writes (cookie/JWT session via `protect`).
router.post("/", protect, writeLimiter, postController.createPost);
router.patch("/:id", protect, writeLimiter, postController.updatePost);
router.delete("/:id", protect, writeLimiter, postController.deletePost);

export default router;
