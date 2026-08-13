import AppError from "../errors/app.error";
import Message, { type MessageDocument } from "../models/message.model";
import type { CreateMessageInput } from "../validations/message.validation";

export interface ListMessagesQuery {
  page?: number;
  limit?: number;
  reason?: string;
  read?: boolean;
}

export interface ListMessagesResult {
  messages: MessageDocument[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const createMessage = async (
  input: CreateMessageInput,
): Promise<MessageDocument> => Message.create({ ...input });

const listMessages = async (
  query: ListMessagesQuery,
): Promise<ListMessagesResult> => {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.max(1, query.limit ?? 8);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (query.reason) filter.reason = query.reason;
  if (typeof query.read === "boolean") filter.read = query.read;

  const [messages, total] = await Promise.all([
    Message.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Message.countDocuments(filter),
  ]);

  return {
    messages,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

/** Malformed ids throw a CastError, which the global handler maps to 400. */
const getMessageById = async (id: string): Promise<MessageDocument> => {
  const message = await Message.findById(id);
  if (!message) throw new AppError("Message not found.", 404);
  return message;
};

const updateMessageRead = async (
  id: string,
  read: boolean,
): Promise<MessageDocument> => {
  const message = await getMessageById(id);
  message.read = read;
  await message.save();
  return message;
};

const deleteMessage = async (id: string): Promise<void> => {
  const message = await getMessageById(id);
  await message.deleteOne();
};

export {
  createMessage,
  listMessages,
  getMessageById,
  updateMessageRead,
  deleteMessage,
};
