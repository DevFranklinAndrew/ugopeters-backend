import Admin, { type AdminDocument } from "../models/admin.model";
import AppError from "../errors/app.error";

/**
 * Verifies an email/password pair against the stored admin. Throws a 401 on
 * any mismatch (unknown email or wrong password) with the same message, so the
 * response never reveals whether the email exists.
 */
const verifyCredentials = async (
  email: string,
  password: string,
): Promise<AdminDocument> => {
  const admin = await Admin.findOne({ email }).select("+password");

  if (!admin || !(await admin.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  return admin;
};

/**
 * Loads an admin by id (used by `/me` and the auth middleware). Throws 401 if
 * the account no longer exists so a stale token can't stay "logged in".
 */
const getAdminById = async (id: string): Promise<AdminDocument> => {
  const admin = await Admin.findById(id);
  if (!admin) throw new AppError("This account no longer exists.", 401);
  return admin;
};

export { verifyCredentials, getAdminById };
