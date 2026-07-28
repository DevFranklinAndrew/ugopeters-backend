import bcrypt from "bcryptjs";
import { model, Schema, type HydratedDocument, type Model } from "mongoose";

export interface IAdmin {
  name: string;
  email: string;
  password: string;
  role: "admin";
  createdAt: Date;
  updatedAt: Date;
}

interface IAdminMethods {
  comparePassword(candidate: string): Promise<boolean>;
}

export type AdminDocument = HydratedDocument<IAdmin, IAdminMethods>;
type AdminModel = Model<IAdmin, {}, IAdminMethods>;

const adminSchema = new Schema<IAdmin, AdminModel, IAdminMethods>(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [8, "Password must be at least 8 characters long."],
      select: false,
    },
    role: {
      type: String,
      enum: ["admin"],
      default: "admin",
    },
  },
  { timestamps: true },
);

// Hash the password whenever it is set or changed.
adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

adminSchema.methods.comparePassword = async function (
  candidate: string,
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

const Admin = model<IAdmin, AdminModel>("Admin", adminSchema);

export default Admin;
