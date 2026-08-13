import { Router } from "express";
import authRouter from "./auth.router";
import messageRouter from "./message.router";
import postRouter from "./post.router";
import subscriberRouter from "./subscriber.router";
import uploadRouter from "./upload.router";

const router = Router();

router.use("/admin", authRouter);
router.use("/posts", postRouter);
router.use("/messages", messageRouter);
router.use("/subscribers", subscriberRouter);
router.use("/upload", uploadRouter);

export default router;
