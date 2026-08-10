"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const env_configuration_1 = __importDefault(require("./configurations/env.configuration"));
const app_error_1 = __importDefault(require("./errors/app.error"));
const global_error_1 = __importDefault(require("./errors/global.error"));
const routers_1 = __importDefault(require("./routers"));
const appConfig = (app) => {
    app
        .use((0, cors_1.default)({ credentials: true, origin: [env_configuration_1.default.CLIENT_URL] }))
        .use((0, helmet_1.default)())
        .use(express_1.default.json())
        .set("trust proxy", 1)
        .use((0, morgan_1.default)("dev"));
    app.get("/health", (_req, res) => res.status(200).json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    }));
    app.use("/api", routers_1.default);
    app.use((req, _res, next) => next(new app_error_1.default(`Can't find ${req.originalUrl} on this server!`, 404)));
    app.use(global_error_1.default);
};
exports.default = appConfig;
//# sourceMappingURL=app.config.js.map