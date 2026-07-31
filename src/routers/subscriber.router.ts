import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as subscriberController from "../controllers/subscriber.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// Tight throttle on the public, unauthenticated subscribe form to blunt spam.
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

// Public newsletter subscription.
router.post("/", submitLimiter, subscriberController.subscribe);

// Admin-only management (cookie/JWT session via `protect`).
router.get("/", protect, subscriberController.listSubscribers);
router.delete("/:id", protect, writeLimiter, subscriberController.deleteSubscriber);

export default router;
