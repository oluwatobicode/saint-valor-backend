import type { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import AppError from "../utils/AppError";

type ValidationFieldError = { field: string; message: string };

function isDuplicateKeyError(err: unknown): err is {
  code: number;
  keyValue?: Record<string, unknown>;
} {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === 11000
  );
}

function isMongooseValidationError(err: unknown): err is {
  name: "ValidationError";
  errors: Record<string, { path?: string; message?: string }>;
} {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { name?: unknown }).name === "ValidationError" &&
    "errors" in err
  );
}

function isMongooseCastError(err: unknown): err is {
  name: "CastError";
  path?: string;
  value?: unknown;
  message?: string;
} {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { name?: unknown }).name === "CastError"
  );
}

function isJwtError(err: unknown): err is { name: string } {
  return typeof err === "object" && err !== null && "name" in err;
}

function buildErrorPayload(params: {
  message: string;
  errors?: ValidationFieldError[];
  stack?: string;
}) {
  const payload: {
    success: false;
    message: string;
    errors?: ValidationFieldError[];
    stack?: string;
  } = {
    success: false,
    message: params.message,
  };

  if (params.errors && params.errors.length > 0) payload.errors = params.errors;
  if (params.stack) payload.stack = params.stack;

  return payload;
}

export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.log(err);
  const env = process.env.NODE_ENV || "development";

  let statusCode = 500;
  let message = "Something went wrong";
  let isOperational = false;
  let validationErrors: ValidationFieldError[] | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  } else if (isMongooseValidationError(err)) {
    statusCode = 400;
    const errors = Object.values(err.errors || {})
      .map((e) => ({
        field: e.path || "field",
        message: e.message || "Invalid value",
      }))
      .filter((e) => e.message);

    if (errors.length > 1) {
      message = "Validation error";
      validationErrors = errors;
    } else if (errors.length === 1) {
      message = errors[0].message;
    } else {
      message = "Validation error";
    }

    isOperational = true;
  } else if (isMongooseCastError(err)) {
    statusCode = 400;
    const field = err.path || "field";
    const value = err.value;
    message =
      typeof err.message === "string" && err.message.trim().length > 0
        ? err.message
        : `Invalid value for "${field}": ${String(value)}`;
    isOperational = true;
  } else if (isDuplicateKeyError(err)) {
    statusCode = 409;
    const keyValue = err.keyValue || {};
    const field = Object.keys(keyValue)[0] || "field";
    const value = keyValue[field];
    message =
      value === undefined
        ? `Duplicate value for "${field}"`
        : `Duplicate value for "${field}": ${String(value)}`;
    isOperational = true;
  } else if (isJwtError(err) && err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
    isOperational = true;
  } else if (isJwtError(err) && err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token has expired, please login again";
    isOperational = true;
  } else if (err instanceof MulterError) {
    statusCode = 400;
    const code = err.code;
    if (code === "LIMIT_FILE_SIZE") message = "Uploaded file is too large";
    else if (code === "LIMIT_FILE_COUNT") message = "Too many files uploaded";
    else if (code === "LIMIT_UNEXPECTED_FILE")
      message = "Unexpected file field";
    else message = err.message || "File upload error";
    isOperational = true;
  } else if (typeof err === "object" && err !== null && "message" in err) {
    const maybeMessage = (err as { message?: unknown }).message;
    if (typeof maybeMessage === "string" && maybeMessage.trim().length > 0) {
      // Keep message for dev visibility; prod will still hide if non-operational.
      message = maybeMessage;
    }
  }

  const stack =
    typeof err === "object" && err !== null && "stack" in err
      ? String((err as { stack?: unknown }).stack || "")
      : undefined;

  if (env === "development") {
    return res.status(statusCode).json(
      buildErrorPayload({
        message,
        errors: validationErrors,
        stack,
      }),
    );
  }

  // production: only expose operational errors
  if (!isOperational) {
    statusCode = 500;
    message = "Something went wrong";
  }

  return res.status(statusCode).json(
    buildErrorPayload({
      message,
      errors: validationErrors,
    }),
  );
};

export default globalErrorHandler;
