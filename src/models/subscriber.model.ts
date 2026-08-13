import { model, Schema, type HydratedDocument, type Model } from "mongoose";

/**
 * A newsletter subscriber. The unique index on `email` enforces one row per
 * address; the service upserts, so re-subscribing succeeds rather than 409ing.
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
