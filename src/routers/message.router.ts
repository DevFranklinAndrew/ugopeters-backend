import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as messageController from "../controllers/message.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// Tight: the contact form is public and unauthenticated, so it attracts spam.
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many requests. Please try again later.",
  },
});

// Loose: authenticated writes only need a backstop against runaway clients.
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

router.post("/", submitLimiter, messageController.submitMessage);

router.get("/", protect, messageController.listMessages);
router.patch("/:id", protect, writeLimiter, messageController.markMessageRead);
router.delete("/:id", protect, writeLimiter, messageController.deleteMessage);

export default router;
