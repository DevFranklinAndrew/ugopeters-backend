"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.signToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_configuration_1 = __importDefault(require("../configurations/env.configuration"));
const signToken = (id) => jsonwebtoken_1.default.sign({ id }, env_configuration_1.default.JWT_SECRET, {
    expiresIn: env_configuration_1.default.JWT_EXPIRES_IN,
});
exports.signToken = signToken;
const verifyToken = (token) => jsonwebtoken_1.default.verify(token, env_configuration_1.default.JWT_SECRET);
exports.verifyToken = verifyToken;
//# sourceMappingURL=jwt.util.js.map