import type { NextFunction, Request, Response } from "express";
import AppError from "../errors/app.error";
import * as authService from "../services/auth.service";
import { verifyToken } from "../utils/jwt.util";

/**
 * Guards admin-only routes. Reads the JWT from the HTTP-only cookie (falling
 * back to an `Authorization: Bearer` header), verifies it, loads the admin, and
 * attaches it to `req.admin`. Any failure surfaces as a clean 401 — the SPA
 * relies on this to tell "logged out" from a real error.
 */
const protect = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const header = req.headers.authorization;
    const bearer = header?.startsWith("Bearer ")
      ? header.slice(7)
      : undefined;
    const token = req.cookies?.token ?? bearer;

    if (!token) {
      throw new AppError("You are not logged in. Please log in.", 401);
    }

    const { id } = verifyToken(token);
    req.admin = await authService.getAdminById(id);
    next();
  } catch (error) {
    // Normalise jwt verification failures (invalid/expired) to a 401.
    if (error instanceof AppError) return next(error);
    next(new AppError("Invalid or expired session. Please log in again.", 401));
  }
};

export { protect };
