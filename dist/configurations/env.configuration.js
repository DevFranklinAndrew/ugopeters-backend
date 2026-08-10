"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envConfig = {
    PORT: process.env.PORT ?? "4000",
    NODE_ENV: process.env.NODE_ENV ?? "development",
    MONGO_URI: process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/ugopeters",
    CLIENT_URL: process.env.CLIENT_URL ?? "http://localhost:5173",
};
exports.default = envConfig;
//# sourceMappingURL=env.configuration.js.map