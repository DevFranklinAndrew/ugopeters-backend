import Admin, { type AdminDocument } from "../models/admin.model";
import AppError from "../errors/app.error";

/** Unknown email and wrong password share one message, so the response never
 *  reveals whether an account exists. */
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

/** 401 (not 404) on a missing account, so a stale token can't stay logged in. */
const getAdminById = async (id: string): Promise<AdminDocument> => {
  const admin = await Admin.findById(id);
  if (!admin) throw new AppError("This account no longer exists.", 401);
  return admin;
};

export { verifyCredentials, getAdminById };
