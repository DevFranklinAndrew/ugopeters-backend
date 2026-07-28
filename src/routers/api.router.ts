import { Router } from "express";
import authRouter from "./auth.router";
import postRouter from "./post.router";

const router = Router();

// Admin authentication (login / logout / me) — matches the frontend contract.
router.use("/admin", authRouter);

// Blog posts: public reads + admin-only writes.
router.use("/posts", postRouter);

export default router;
