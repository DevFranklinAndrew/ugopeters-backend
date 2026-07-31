import { model, Schema, type HydratedDocument, type Model } from "mongoose";

/**
 * A newsletter subscriber. Mirrors the frontend `Subscriber` type
 * (frontend/src/admin/data/mockData.ts) minus its `id` — Mongo supplies `_id`,
 * which the controller re-exposes as `id`. The unique index on `email` is what
 * enforces "one row per address"; the service upserts, so a repeat subscribe is
 * a graceful success rather than a duplicate-key error surfaced to the client.
 */
export interface ISubscriber {
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriberDocument = HydratedDocument<ISubscriber>;
type SubscriberModel = Model<ISubscriber>;

const subscriberSchema = new Schema<ISubscriber, SubscriberModel>(
  {
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true },
);

const Subscriber = model<ISubscriber, SubscriberModel>(
  "Subscriber",
  subscriberSchema,
);

export default Subscriber;
