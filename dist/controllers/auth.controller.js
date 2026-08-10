"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.login = void 0;
const env_configuration_1 = __importDefault(require("../configurations/env.configuration"));
const authService = __importStar(require("../services/auth.service"));
const jwt_util_1 = require("../utils/jwt.util");
const auth_validation_1 = require("../validations/auth.validation");
const COOKIE_NAME = "token";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const isProd = env_configuration_1.default.NODE_ENV === "production";
const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    // Cross-site in production (SPA on Vercel → API on another host) requires
    // SameSite=None; "lax" is fine for same-site localhost dev.
    sameSite: isProd ? "none" : "lax",
    maxAge: COOKIE_MAX_AGE,
};
/** Shapes an admin document into the safe, password-free payload the API returns. */
const toPublicAdmin = (admin) => ({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
});
const login = async (req, res) => {
    const { email, password } = (0, auth_validation_1.validateLogin)(req.body);
    const admin = await authService.verifyCredentials(email, password);
    const token = (0, jwt_util_1.signToken)(admin.id);
    res.cookie(COOKIE_NAME, token, cookieOptions);
    res.status(200).json({
        status: "success",
        data: { admin: toPublicAdmin(admin) },
    });
};
exports.login = login;
const logout = async (_req, res) => {
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
    res.status(200).json({ status: "success", message: "Logged out." });
};
exports.logout = logout;
const getMe = async (req, res) => {
    // `protect` guarantees req.admin is set.
    res.status(200).json({
        status: "success",
        data: { admin: toPublicAdmin(req.admin) },
    });
};
exports.getMe = getMe;
//# sourceMappingURL=auth.controller.js.map