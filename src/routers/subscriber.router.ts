import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as subscriberController from "../controllers/subscriber.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// Tight: the subscribe form is public and unauthenticated, so it attracts spam.
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

router.post("/", submitLimiter, subscriberController.subscribe);

router.get("/", protect, subscriberController.listSubscribers);
router.delete("/:id", protect, writeLimiter, subscriberController.deleteSubscriber);

export default router;
