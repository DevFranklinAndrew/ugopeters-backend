import { model, Schema, type HydratedDocument, type Model } from "mongoose";

/** A contact-form submission; `read` tracks the admin inbox state. */
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
    // Free-form, not an enum: the admin filter is built from the stored values,
    // so it survives changes to REASON_OPTIONS.
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
