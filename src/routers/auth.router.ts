import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as authController from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// Throttle login attempts to blunt brute-force / credential-stuffing.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many login attempts. Please try again later.",
  },
});

router.post("/login", loginLimiter, authController.login);
router.post("/logout", authController.logout);
router.get("/me", protect, authController.getMe);

export default router;
