import type { NextFunction, Request, Response } from "express";
import { Error as MongooseError } from "mongoose";
import envConfig from "../configurations/env.configuration";
import AppError from "./app.error";

const handleCastError = (error: any) =>
  new AppError(`Invalid ${error.path}: ${error.value}`, 400);

const handleDuplicateKeyError = (error: any) => {
  const field = Object.keys(error.keyValue)[0];
  const value = error.keyValue[field!];
  const capitalizeField = field![0]?.toUpperCase() + field!.slice(1);

  return new AppError(
    `${capitalizeField} ${value} already exists on our record.`,
    409,
  );
};

const handleValidationError = (error: MongooseError.ValidationError) => {
  const messages = Object.values(error.errors).map((err) => err.message);
  return new AppError(messages.join(". "), 422);
};

const globalErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let error: Error | AppError = err;

  if (!(error instanceof AppError)) {
    if (error.name === "CastError") error = handleCastError(error);
    if (error.name === "ValidationError")
      error = handleValidationError(error as MongooseError.ValidationError);
    if ((error as any).code === 11000) error = handleDuplicateKeyError(error);
  }

  // DEVELOPMENT MODE
  if (envConfig.NODE_ENV === "development") {
    const statusCode = error instanceof AppError ? error.statusCode : 500;

    console.log(error);
    res.status(statusCode).json({
      status: error instanceof AppError ? error.status : "error",
      message: error.message,
      stack: error.stack,
      error,
    });
    return;
  }

  // PRODUCTION MODE
  if (error instanceof AppError && error.isOperational) {
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

export default globalErrorHandler;
