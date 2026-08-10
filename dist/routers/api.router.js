"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_router_1 = __importDefault(require("./auth.router"));
const message_router_1 = __importDefault(require("./message.router"));
const post_router_1 = __importDefault(require("./post.router"));
const subscriber_router_1 = __importDefault(require("./subscriber.router"));
const upload_router_1 = __importDefault(require("./upload.router"));
const router = (0, express_1.Router)();
// Admin authentication (login / logout / me) — matches the frontend contract.
router.use("/admin", auth_router_1.default);
// Blog posts: public reads + admin-only writes.
router.use("/posts", post_router_1.default);
// Contact messages: public submit + admin-only inbox management.
router.use("/messages", message_router_1.default);
// Newsletter subscribers: public subscribe + admin-only management.
router.use("/subscribers", subscriber_router_1.default);
// Image uploads (admin-only) → Cloudinary URL.
router.use("/upload", upload_router_1.default);
exports.default = router;
//# sourceMappingURL=api.router.js.map