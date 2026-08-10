"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllEmails = exports.deleteSubscriber = exports.listSubscribers = exports.subscribe = void 0;
const app_error_1 = __importDefault(require("../errors/app.error"));
const subscriber_model_1 = __importDefault(require("../models/subscriber.model"));
/**
 * Idempotent subscribe. Upserts by email so re-subscribing is a graceful
 * success (never a duplicate-key error), and it's race-safe under concurrent
 * requests. `created` is true only when a new row was actually inserted.
 */
const subscribe = async (email) => {
    const result = await subscriber_model_1.default.findOneAndUpdate({ email }, { $setOnInsert: { email } }, {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true,
        includeResultMetadata: true,
    });
    const subscriber = result.value;
    const created = Boolean(result.lastErrorObject?.upserted);
    return { subscriber, created };
};
exports.subscribe = subscribe;
/** Paginated, searchable list of subscribers, newest first (for the admin page). */
const listSubscribers = async (query) => {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.max(1, query.limit ?? 10);
    const skip = (page - 1) * limit;
    const filter = {};
    if (query.search)
        filter.email = new RegExp(query.search, "i");
    const [subscribers, total] = await Promise.all([
        subscriber_model_1.default.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        subscriber_model_1.default.countDocuments(filter),
    ]);
    return {
        subscribers,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
};
exports.listSubscribers = listSubscribers;
/** Deletes a subscriber by id. 404 if missing. */
const deleteSubscriber = async (id) => {
    const subscriber = await subscriber_model_1.default.findById(id);
    if (!subscriber)
        throw new app_error_1.default("Subscriber not found.", 404);
    await subscriber.deleteOne();
};
exports.deleteSubscriber = deleteSubscriber;
/** Every subscriber's email address (for newsletter broadcasts). */
const getAllEmails = async () => {
    const docs = await subscriber_model_1.default.find().select("email").lean();
    return docs.map((doc) => doc.email);
};
exports.getAllEmails = getAllEmails;
//# sourceMappingURL=subscriber.service.js.map