import type { CookieOptions, Request, Response } from "express";
import envConfig from "../configurations/env.configuration";
import type { AdminDocument } from "../models/admin.model";
import * as authService from "../services/auth.service";
import { signToken } from "../utils/jwt.util";
import { validateLogin } from "../validations/auth.validation";

const COOKIE_NAME = "token";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const isProd = envConfig.NODE_ENV === "production";

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  // Production is cross-site (SPA on Vercel → API elsewhere), which needs None.
  sameSite: isProd ? "none" : "lax",
  maxAge: COOKIE_MAX_AGE,
};

const toPublicAdmin = (admin: AdminDocument) => ({
  id: admin.id as string,
  name: admin.name,
  email: admin.email,
  role: admin.role,
});

const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = validateLogin(req.body);
  const admin = await authService.verifyCredentials(email, password);

  const token = signToken(admin.id);
  res.cookie(COOKIE_NAME, token, cookieOptions);

  res.status(200).json({
    status: "success",
    data: { admin: toPublicAdmin(admin) },
  });
};

const logout = async (_req: Request, res: Response): Promise<void> => {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
  res.status(200).json({ status: "success", message: "Logged out." });
};

const getMe = async (req: Request, res: Response): Promise<void> => {
  // `protect` guarantees req.admin is set.
  res.status(200).json({
    status: "success",
    data: { admin: toPublicAdmin(req.admin!) },
  });
};

export { login, logout, getMe };
