"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubscriber = exports.listSubscribers = exports.subscribe = void 0;
const emailService = __importStar(require("../services/email.service"));
const subscriberService = __importStar(require("../services/subscriber.service"));
const query_util_1 = require("../utils/query.util");
const subscriber_validation_1 = require("../validations/subscriber.validation");
/** Shapes a subscriber document into the API payload (exposes `_id` as `id`). */
const toPublicSubscriber = (subscriber) => ({
    id: subscriber.id,
    email: subscriber.email,
    createdAt: subscriber.createdAt,
});
const subscribe = async (req, res) => {
    const { email } = (0, subscriber_validation_1.validateCreateSubscriber)(req.body);
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
exports.subscribe = subscribe;
const listSubscribers = async (req, res) => {
    const { search } = req.query;
    const { subscribers, pagination } = await subscriberService.listSubscribers({
        page: (0, query_util_1.toPositiveInt)(req.query.page),
        limit: (0, query_util_1.toPositiveInt)(req.query.limit),
        search: typeof search === "string" ? search : undefined,
    });
    res.status(200).json({
        status: "success",
        data: { subscribers: subscribers.map(toPublicSubscriber), pagination },
    });
};
exports.listSubscribers = listSubscribers;
const deleteSubscriber = async (req, res) => {
    await subscriberService.deleteSubscriber(String(req.params.id));
    res.status(200).json({ status: "success", message: "Subscriber removed." });
};
exports.deleteSubscriber = deleteSubscriber;
//# sourceMappingURL=subscriber.controller.js.map