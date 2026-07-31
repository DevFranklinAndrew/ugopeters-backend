import { model, Schema, type HydratedDocument, type Model } from "mongoose";

/**
 * A contact-form submission. Mirrors the frontend `ContactMessage` type
 * (frontend/src/admin/data/mockData.ts) minus its `id` — Mongo supplies `_id`,
 * which the controller re-exposes as `id`. `read` tracks the admin inbox state.
 */
export interface IMessage {
  name: string;
  email: string;
  reason: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type MessageDocument = HydratedDocument<IMessage>;
type MessageModel = Model<IMessage>;

const messageSchema = new Schema<IMessage, MessageModel>(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      lowercase: true,
      trim: true,
    },
    // Free-form string, not an enum: the admin filter dropdown is built from the
    // reasons actually stored, so this stays resilient if REASON_OPTIONS changes.
    reason: {
      type: String,
      required: [true, "Reason is required."],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required."],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required."],
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Message = model<IMessage, MessageModel>("Message", messageSchema);

export default Message;
