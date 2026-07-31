import type { Request, Response } from "express";
import type { SubscriberDocument } from "../models/subscriber.model";
import * as emailService from "../services/email.service";
import * as subscriberService from "../services/subscriber.service";
import { toPositiveInt } from "../utils/query.util";
import { validateCreateSubscriber } from "../validations/subscriber.validation";

/** Shapes a subscriber document into the API payload (exposes `_id` as `id`). */
const toPublicSubscriber = (subscriber: SubscriberDocument) => ({
  id: subscriber.id as string,
  email: subscriber.email,
  createdAt: subscriber.createdAt,
});

const subscribe = async (req: Request, res: Response): Promise<void> => {
  const { email } = validateCreateSubscriber(req.body);
  const { subscriber, created } = await subscriberService.subscribe(email);

  // Only on a genuinely new signup: welcome the subscriber and alert Ugo.
  // Best-effort side effects, not awaited so they can't block or fail the
  // response (each fn handles its own errors); repeats send nothing.
  if (created) {
    emailService.sendWelcomeEmail(subscriber.email);
    emailService.sendSubscriberNotification(subscriber.email);
  }

  res.status(created ? 201 : 200).json({
    status: "success",
    message: created ? "You're subscribed." : "You're already subscribed.",
    data: { subscriber: toPublicSubscriber(subscriber) },
  });
};

const listSubscribers = async (req: Request, res: Response): Promise<void> => {
  const { search } = req.query;

  const { subscribers, pagination } = await subscriberService.listSubscribers({
    page: toPositiveInt(req.query.page),
    limit: toPositiveInt(req.query.limit),
    search: typeof search === "string" ? search : undefined,
  });

  res.status(200).json({
    status: "success",
    data: { subscribers: subscribers.map(toPublicSubscriber), pagination },
  });
};

const deleteSubscriber = async (req: Request, res: Response): Promise<void> => {
  await subscriberService.deleteSubscriber(String(req.params.id));
  res.status(200).json({ status: "success", message: "Subscriber removed." });
};

export { subscribe, listSubscribers, deleteSubscriber };
