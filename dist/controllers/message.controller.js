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
exports.deleteMessage = exports.markMessageRead = exports.listMessages = exports.submitMessage = void 0;
const emailService = __importStar(require("../services/email.service"));
const messageService = __importStar(require("../services/message.service"));
const query_util_1 = require("../utils/query.util");
const message_validation_1 = require("../validations/message.validation");
/** Shapes a message document into the API payload (exposes `_id` as `id`). */
const toPublicMessage = (message) => ({
    id: message.id,
    name: message.name,
    email: message.email,
    reason: message.reason,
    subject: message.subject,
    message: message.message,
    read: message.read,
    createdAt: message.createdAt,
});
const submitMessage = async (req, res) => {
    const input = (0, message_validation_1.validateCreateMessage)(req.body);
    const message = await messageService.createMessage(input);
    // Notify Ugo — best-effort side effect, not awaited so it can't block or fail
    // the response (the message is already saved; the fn handles its own errors).
    emailService.sendContactNotification(message);
    res.status(201).json({
        status: "success",
        data: { message: toPublicMessage(message) },
    });
};
exports.submitMessage = submitMessage;
const listMessages = async (req, res) => {
    const { reason } = req.query;
    const { messages, pagination } = await messageService.listMessages({
        page: (0, query_util_1.toPositiveInt)(req.query.page),
        limit: (0, query_util_1.toPositiveInt)(req.query.limit),
        reason: typeof reason === "string" ? reason : undefined,
        read: (0, query_util_1.toBoolean)(req.query.read),
    });
    res.status(200).json({
        status: "success",
        data: { messages: messages.map(toPublicMessage), pagination },
    });
};
exports.listMessages = listMessages;
const markMessageRead = async (req, res) => {
    const { read } = (0, message_validation_1.validateUpdateMessage)(req.body);
    const message = await messageService.updateMessageRead(String(req.params.id), read);
    res.status(200).json({
        status: "success",
        data: { message: toPublicMessage(message) },
    });
};
exports.markMessageRead = markMessageRead;
const deleteMessage = async (req, res) => {
    await messageService.deleteMessage(String(req.params.id));
    res.status(200).json({ status: "success", message: "Message deleted." });
};
exports.deleteMessage = deleteMessage;
//# sourceMappingURL=message.controller.js.map