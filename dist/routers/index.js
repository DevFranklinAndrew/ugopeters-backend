"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
/**
 * Root API router, mounted at /api by appConfig.
 *
 * Feature routers are added in later steps, e.g.:
 *   router.use("/posts", postRouter);
 *   router.use("/contact", contactRouter);
 *   router.use("/subscribers", subscriberRouter);
 */
const router = (0, express_1.Router)();
exports.default = router;
//# sourceMappingURL=index.js.map