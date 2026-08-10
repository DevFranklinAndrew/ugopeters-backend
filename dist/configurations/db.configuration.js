"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const env_configuration_1 = __importDefault(require("./env.configuration"));
const dbConfig = async () => {
    try {
        await mongoose_1.default.connect(env_configuration_1.default.MONGO_URI);
        console.log("[db] Connected to MongoDB");
    }
    catch (error) {
        console.error("[db] Connection error:", error instanceof Error ? error.message : error);
        process.exit(1);
    }
};
exports.default = dbConfig;
//# sourceMappingURL=db.configuration.js.map