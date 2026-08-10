"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const env_configuration_1 = __importDefault(require("../configurations/env.configuration"));
const admin_model_1 = __importDefault(require("../models/admin.model"));
/**
 * Provisions the single CMS administrator from environment variables
 * (ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD). Idempotent: if an admin with the
 * configured email already exists it is left untouched. Run with `npm run seed:admin`.
 */
const seedAdmin = async () => {
    try {
        await mongoose_1.default.connect(env_configuration_1.default.MONGO_URI);
        console.log("[seed] Connected to MongoDB");
        const email = env_configuration_1.default.ADMIN_EMAIL.toLowerCase().trim();
        const existing = await admin_model_1.default.findOne({ email });
        if (existing) {
            console.log(`[seed] Admin already exists for ${email} — skipping.`);
            return;
        }
        // Use `create` (not updateOne) so the pre-save hook hashes the password.
        const admin = await admin_model_1.default.create({
            name: env_configuration_1.default.ADMIN_NAME,
            email,
            password: env_configuration_1.default.ADMIN_PASSWORD,
        });
        console.log(`[seed] Created admin: ${admin.name} <${admin.email}>`);
    }
    catch (error) {
        console.error("[seed] Failed:", error instanceof Error ? error.message : error);
        process.exitCode = 1;
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log("[seed] Disconnected.");
    }
};
seedAdmin();
//# sourceMappingURL=seed-admin.script.js.map