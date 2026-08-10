"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const env_configuration_1 = __importDefault(require("./configurations/env.configuration"));
const app_error_1 = __importDefault(require("./errors/app.error"));
const global_error_1 = __importDefault(require("./errors/global.error"));
const api_router_1 = __importDefault(require("./routers/api.router"));
const appConfig = (app) => {
    app
        .use((0, cors_1.default)({
        credentials: true,
        // Driven by CORS_ORIGINS. Hosts used to be hardcoded here, so every new
        // frontend origin (apex, www, a custom domain) needed a code change and
        // redeploy before the browser would accept a response.
        origin: env_configuration_1.default.CORS_ORIGINS,
    }))
        .use((0, helmet_1.default)())
        // Images now upload to Cloudinary (POST /api/upload) and posts store only
        // URLs, so bodies are small. 1mb is generous headroom for long articles.
        .use(express_1.default.json({ limit: "1mb" }))
        .use((0, cookie_parser_1.default)())
        .set("trust proxy", 1)
        .use((0, morgan_1.default)("dev"));
    app.get("/health", (_req, res) => res.status(200).json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    }));
    app.use("/api", api_router_1.default);
    app.use((req, _res, next) => next(new app_error_1.default(`Can't find ${req.originalUrl} on this server!`, 404)));
    app.use(global_error_1.default);
};
exports.default = appConfig;
//# sourceMappingURL=app.config.js.map