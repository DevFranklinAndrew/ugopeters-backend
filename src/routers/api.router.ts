import { Router } from "express";
import authRouter from "./auth.router";
import messageRouter from "./message.router";
import postRouter from "./post.router";
import uploadRouter from "./upload.router";

const router = Router();

// Admin authentication (login / logout / me) — matches the frontend contract.
router.use("/admin", authRouter);

// Blog posts: public reads + admin-only writes.
router.use("/posts", postRouter);

// Contact messages: public submit + admin-only inbox management.
router.use("/messages", messageRouter);

// Image uploads (admin-only) → Cloudinary URL.
router.use("/upload", uploadRouter);

export default router;
