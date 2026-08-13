import AppError from "../errors/app.error";
import Subscriber, {
  type SubscriberDocument,
} from "../models/subscriber.model";

export interface ListSubscribersQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ListSubscribersResult {
  subscribers: SubscriberDocument[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Upserts so re-subscribing succeeds instead of hitting a duplicate key, and
 *  stays race-safe. `created` is true only when a row was actually inserted. */
const subscribe = async (
  email: string,
): Promise<{ subscriber: SubscriberDocument; created: boolean }> => {
  const result = await Subscriber.findOneAndUpdate(
    { email },
    { $setOnInsert: { email } },
    {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
      includeResultMetadata: true,
    },
  );

  const subscriber = result.value as SubscriberDocument;
  const created = Boolean(result.lastErrorObject?.upserted);
  return { subscriber, created };
};

const listSubscribers = async (
  query: ListSubscribersQuery,
): Promise<ListSubscribersResult> => {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.max(1, query.limit ?? 10);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (query.search) filter.email = new RegExp(query.search, "i");

  const [subscribers, total] = await Promise.all([
    Subscriber.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Subscriber.countDocuments(filter),
  ]);

  return {
    subscribers,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const deleteSubscriber = async (id: string): Promise<void> => {
  const subscriber = await Subscriber.findById(id);
  if (!subscriber) throw new AppError("Subscriber not found.", 404);
  await subscriber.deleteOne();
};

const getAllEmails = async (): Promise<string[]> => {
  const docs = await Subscriber.find().select("email").lean();
  return docs.map((doc) => doc.email);
};

export { subscribe, listSubscribers, deleteSubscriber, getAllEmails };
