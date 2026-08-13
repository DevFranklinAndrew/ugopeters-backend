import mongoose from "mongoose";
import envConfig from "../configurations/env.configuration";
import Admin from "../models/admin.model";

/** `npm run seed:admin` — provisions the CMS admin from ADMIN_* env vars.
 *  Idempotent: an existing account for that email is left untouched. */
const seedAdmin = async (): Promise<void> => {
  try {
    await mongoose.connect(envConfig.MONGO_URI);
    console.log("[seed] Connected to MongoDB");

    const email = envConfig.ADMIN_EMAIL.toLowerCase().trim();
    const existing = await Admin.findOne({ email });

    if (existing) {
      console.log(`[seed] Admin already exists for ${email} — skipping.`);
      return;
    }

    // Use `create` (not updateOne) so the pre-save hook hashes the password.
    const admin = await Admin.create({
      name: envConfig.ADMIN_NAME,
      email,
      password: envConfig.ADMIN_PASSWORD,
    });

    console.log(`[seed] Created admin: ${admin.name} <${admin.email}>`);
  } catch (error) {
    console.error(
      "[seed] Failed:",
      error instanceof Error ? error.message : error,
    );
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("[seed] Disconnected.");
  }
};

seedAdmin();
