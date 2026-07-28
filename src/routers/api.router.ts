import { Router } from "express";
import authRouter from "./auth.router";

const router = Router();

// Admin authentication (login / logout / me) — matches the frontend contract.
router.use("/admin", authRouter);

export default router;
