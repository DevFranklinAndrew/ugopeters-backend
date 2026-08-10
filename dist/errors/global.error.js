"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_configuration_1 = __importDefault(require("../configurations/env.configuration"));
const app_error_1 = __importDefault(require("./app.error"));
const handleCastError = (error) => new app_error_1.default(`Invalid ${error.path}: ${error.value}`, 400);
const handleDuplicateKeyError = (error) => {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];
    const capitalizeField = field[0]?.toUpperCase() + field.slice(1);
    return new app_error_1.default(`${capitalizeField} ${value} already exists on our record.`, 409);
};
const handleValidationError = (error) => {
    const messages = Object.values(error.errors).map((err) => err.message);
    return new app_error_1.default(messages.join(". "), 422);
};
const globalErrorHandler = (err, _req, res, _next) => {
    let error = err;
    if (!(error instanceof app_error_1.default)) {
        if (error.name === "CastError")
            error = handleCastError(error);
        if (error.name === "ValidationError")
            error = handleValidationError(error);
        if (error.code === 11000)
            error = handleDuplicateKeyError(error);
    }
    // DEVELOPMENT MODE
    if (env_configuration_1.default.NODE_ENV === "development") {
        const statusCode = error instanceof app_error_1.default ? error.statusCode : 500;
        console.log(error);
        res.status(statusCode).json({
            status: error instanceof app_error_1.default ? error.status : "error",
            message: error.message,
            stack: error.stack,
            error,
        });
        return;
    }
    // PRODUCTION MODE
    if (error instanceof app_error_1.default && error.isOperational) {
        res
            .status(error.statusCode)
            .json({ status: error.status, message: error.message });
        return;
    }
    console.error("UNEXPECTED_ERROR:", {
        message: error.message,
        stack: error.stack,
    });
    res.status(500).json({
        status: "error",
        message: "An unexpected error occurred. Please try again.",
    });
};
exports.default = globalErrorHandler;
//# sourceMappingURL=global.error.js.map