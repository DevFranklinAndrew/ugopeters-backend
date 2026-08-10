"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app_config_1 = __importDefault(require("./app.config"));
const db_configuration_1 = __importDefault(require("./configurations/db.configuration"));
const env_configuration_1 = __importDefault(require("./configurations/env.configuration"));
const app = (0, express_1.default)();
const port = Number(env_configuration_1.default.PORT);
(0, app_config_1.default)(app);
const server = app.listen(port, () => {
    console.log(`Server is listening to PORT: ${port}`);
});
(0, db_configuration_1.default)();
process.on("uncaughtException", (error) => {
    console.error("uncaughtException:", error.name, error.message);
    process.exit(1);
});
process.on("unhandledRejection", (error) => {
    if (error instanceof Error)
        console.error("unhandledRejection:", error.name, error.message);
    server.close(() => process.exit(1));
});
//# sourceMappingURL=server.js.map