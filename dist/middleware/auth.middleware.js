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
exports.protect = void 0;
const app_error_1 = __importDefault(require("../errors/app.error"));
const authService = __importStar(require("../services/auth.service"));
const jwt_util_1 = require("../utils/jwt.util");
/**
 * Guards admin-only routes. Reads the JWT from the HTTP-only cookie (falling
 * back to an `Authorization: Bearer` header), verifies it, loads the admin, and
 * attaches it to `req.admin`. Any failure surfaces as a clean 401 — the SPA
 * relies on this to tell "logged out" from a real error.
 */
const protect = async (req, _res, next) => {
    try {
        const header = req.headers.authorization;
        const bearer = header?.startsWith("Bearer ")
            ? header.slice(7)
            : undefined;
        const token = req.cookies?.token ?? bearer;
        if (!token) {
            throw new app_error_1.default("You are not logged in. Please log in.", 401);
        }
        const { id } = (0, jwt_util_1.verifyToken)(token);
        req.admin = await authService.getAdminById(id);
        next();
    }
    catch (error) {
        // Normalise jwt verification failures (invalid/expired) to a 401.
        if (error instanceof app_error_1.default)
            return next(error);
        next(new app_error_1.default("Invalid or expired session. Please log in again.", 401));
    }
};
exports.protect = protect;
//# sourceMappingURL=auth.middleware.js.map