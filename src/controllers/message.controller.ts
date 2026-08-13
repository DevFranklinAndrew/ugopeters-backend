import type { Request, Response } from "express";
import type { MessageDocument } from "../models/message.model";
import * as emailService from "../services/email.service";
import * as messageService from "../services/message.service";
import { toBoolean, toPositiveInt } from "../utils/query.util";
import {
  validateCreateMessage,
  validateUpdateMessage,
} from "../validations/message.validation";

const toPublicMessage = (message: MessageDocument) => ({
  id: message.id as string,
  name: message.name,
  email: message.email,
  reason: message.reason,
  subject: message.subject,
  message: message.message,
  read: message.read,
  createdAt: message.createdAt,
});

const submitMessage = async (req: Request, res: Response): Promise<void> => {
  const input = validateCreateMessage(req.body);
  const message = await messageService.createMessage(input);

  // Deliberately not awaited: best-effort, and it handles its own errors.
  emailService.sendContactNotification(message);

  res.status(201).json({
    status: "success",
    data: { message: toPublicMessage(message) },
  });
};

const listMessages = async (req: Request, res: Response): Promise<void> => {
  const { reason } = req.query;

  const { messages, pagination } = await messageService.listMessages({
    page: toPositiveInt(req.query.page),
    limit: toPositiveInt(req.query.limit),
    reason: typeof reason === "string" ? reason : undefined,
    read: toBoolean(req.query.read),
  });

  res.status(200).json({
    status: "success",
    data: { messages: messages.map(toPublicMessage), pagination },
  });
};

const markMessageRead = async (req: Request, res: Response): Promise<void> => {
  const { read } = validateUpdateMessage(req.body);
  const message = await messageService.updateMessageRead(
    String(req.params.id),
    read,
  );
  res.status(200).json({
    status: "success",
    data: { message: toPublicMessage(message) },
  });
};

const deleteMessage = async (req: Request, res: Response): Promise<void> => {
  await messageService.deleteMessage(String(req.params.id));
  res.status(200).json({ status: "success", message: "Message deleted." });
};

export { submitMessage, listMessages, markMessageRead, deleteMessage };
