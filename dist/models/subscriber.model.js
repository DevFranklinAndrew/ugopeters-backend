"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const subscriberSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: [true, "Email is required."],
        unique: true,
        lowercase: true,
        trim: true,
    },
}, { timestamps: true });
const Subscriber = (0, mongoose_1.model)("Subscriber", subscriberSchema);
exports.default = Subscriber;
//# sourceMappingURL=subscriber.model.js.map