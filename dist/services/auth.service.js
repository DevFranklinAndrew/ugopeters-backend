"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminById = exports.verifyCredentials = void 0;
const admin_model_1 = __importDefault(require("../models/admin.model"));
const app_error_1 = __importDefault(require("../errors/app.error"));
/**
 * Verifies an email/password pair against the stored admin. Throws a 401 on
 * any mismatch (unknown email or wrong password) with the same message, so the
 * response never reveals whether the email exists.
 */
const verifyCredentials = async (email, password) => {
    const admin = await admin_model_1.default.findOne({ email }).select("+password");
    if (!admin || !(await admin.comparePassword(password))) {
        throw new app_error_1.default("Invalid email or password", 401);
    }
    return admin;
};
exports.verifyCredentials = verifyCredentials;
/**
 * Loads an admin by id (used by `/me` and the auth middleware). Throws 401 if
 * the account no longer exists so a stale token can't stay "logged in".
 */
const getAdminById = async (id) => {
    const admin = await admin_model_1.default.findById(id);
    if (!admin)
        throw new app_error_1.default("This account no longer exists.", 401);
    return admin;
};
exports.getAdminById = getAdminById;
//# sourceMappingURL=auth.service.js.map