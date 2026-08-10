"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
const env_configuration_1 = __importDefault(require("./env.configuration"));
/**
 * Configures the Cloudinary SDK from the environment. Runs as an import
 * side-effect (like env.configuration's dotenv.config()), so importing this
 * module anywhere ensures the SDK is ready before the first upload.
 */
cloudinary_1.v2.config({
    cloud_name: env_configuration_1.default.CLOUDINARY_CLOUD_NAME,
    api_key: env_configuration_1.default.CLOUDINARY_API_KEY,
    api_secret: env_configuration_1.default.CLOUDINARY_API_SECRET,
    secure: true,
});
exports.default = cloudinary_1.v2;
//# sourceMappingURL=cloudinary.configuration.js.map