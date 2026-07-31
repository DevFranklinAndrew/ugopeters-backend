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

/**
 * Idempotent subscribe. Upserts by email so re-subscribing is a graceful
 * success (never a duplicate-key error), and it's race-safe under concurrent
 * requests. `created` is true only when a new row was actually inserted.
 */
const subscribe = async (
  email: string,
): Promise<{ subscriber: SubscriberDocument; created: boolean }> => {
  const result = await Subscriber.findOneAndUpdate(
    { email },
    { $setOnInsert: { email } },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      includeResultMetadata: true,
    },
  );

  const subscriber = result.value as SubscriberDocument;
  const created = Boolean(result.lastErrorObject?.upserted);
  return { subscriber, created };
};

/** Paginated, searchable list of subscribers, newest first (for the admin page). */
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

/** Deletes a subscriber by id. 404 if missing. */
const deleteSubscriber = async (id: string): Promise<void> => {
  const subscriber = await Subscriber.findById(id);
  if (!subscriber) throw new AppError("Subscriber not found.", 404);
  await subscriber.deleteOne();
};

export { subscribe, listSubscribers, deleteSubscriber };
