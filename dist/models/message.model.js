"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Name is required."],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required."],
        lowercase: true,
        trim: true,
    },
    // Free-form string, not an enum: the admin filter dropdown is built from the
    // reasons actually stored, so this stays resilient if REASON_OPTIONS changes.
    reason: {
        type: String,
        required: [true, "Reason is required."],
        trim: true,
    },
    subject: {
        type: String,
        required: [true, "Subject is required."],
        trim: true,
    },
    message: {
        type: String,
        required: [true, "Message is required."],
        trim: true,
    },
    read: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
const Message = (0, mongoose_1.model)("Message", messageSchema);
exports.default = Message;
//# sourceMappingURL=message.model.js.map