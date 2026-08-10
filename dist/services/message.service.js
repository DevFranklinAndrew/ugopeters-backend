"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessage = exports.updateMessageRead = exports.getMessageById = exports.listMessages = exports.createMessage = void 0;
const app_error_1 = __importDefault(require("../errors/app.error"));
const message_model_1 = __importDefault(require("../models/message.model"));
/** Persists a contact submission. `read` defaults to false via the schema. */
const createMessage = async (input) => message_model_1.default.create({ ...input });
exports.createMessage = createMessage;
/** Paginated, filterable list of messages, newest first (for the admin inbox). */
const listMessages = async (query) => {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.max(1, query.limit ?? 8);
    const skip = (page - 1) * limit;
    const filter = {};
    if (query.reason)
        filter.reason = query.reason;
    if (typeof query.read === "boolean")
        filter.read = query.read;
    const [messages, total] = await Promise.all([
        message_model_1.default.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        message_model_1.default.countDocuments(filter),
    ]);
    return {
        messages,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
};
exports.listMessages = listMessages;
/** Loads a message by Mongo `_id`; throws 404 (CastErrors are handled globally). */
const getMessageById = async (id) => {
    const message = await message_model_1.default.findById(id);
    if (!message)
        throw new app_error_1.default("Message not found.", 404);
    return message;
};
exports.getMessageById = getMessageById;
/** Toggles a message's read status. 404 if it doesn't exist. */
const updateMessageRead = async (id, read) => {
    const message = await getMessageById(id);
    message.read = read;
    await message.save();
    return message;
};
exports.updateMessageRead = updateMessageRead;
/** Deletes a message by id. 404 if missing. */
const deleteMessage = async (id) => {
    const message = await getMessageById(id);
    await message.deleteOne();
};
exports.deleteMessage = deleteMessage;
//# sourceMappingURL=message.service.js.map