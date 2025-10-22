import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import { MongoError } from "mongodb";
import { isAppError } from "../utils/app-error.js";

// Error response type
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
  timestamp: string;
}

// Global Error Handler
export const errorHandler = (err: Error, c: Context) => {
  const timestamp = new Date().toISOString();

  // 1. Custom AppError
  if (isAppError(err)) {
    return c.json<ErrorResponse>(
      {
        success: false,
        error: {
          message: err.message,
          code: err.code,
          details: err.details,
        },
        timestamp,
      },
      err.status as any
    );
  }

  // 2. Zod errors
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((error) => ({
      path: error.path.join("."),
      message: error.message,
      code: error.code,
    }));

    return c.json<ErrorResponse>(
      {
        success: false,
        error: {
          message: "Validasyon hatası",
          code: "VALIDATION_ERROR",
          details: formattedErrors,
        },
        timestamp,
      },
      400
    );
  }

  // 3. Hono HTTP Exception
  if (err instanceof HTTPException) {
    return c.json<ErrorResponse>(
      {
        success: false,
        error: {
          message: err.message,
          code: "HTTP_EXCEPTION",
        },
        timestamp,
      },
      err.status
    );
  }

  // 4. MongoDB errors
  if (err instanceof MongoError || (err as any).name === "MongoError") {
    const mongoError = err as MongoError;

    // Duplicate key error
    if (mongoError.code === 11000) {
      const field =
        Object.keys((mongoError as any).keyPattern || {})[0] || "field";
      return c.json<ErrorResponse>(
        {
          success: false,
          error: {
            message: `Bu ${field} zaten kullanılıyor`,
            code: "DUPLICATE_KEY",
            details: { field },
          },
          timestamp,
        },
        409
      );
    }

    // Database validation error
    if (mongoError.code === 121) {
      return c.json<ErrorResponse>(
        {
          success: false,
          error: {
            message: "Veritabanı validasyon hatası",
            code: "DB_VALIDATION_ERROR",
            details: mongoError.message,
          },
          timestamp,
        },
        400
      );
    }

    // Database connection error
    if (mongoError.message.includes("connect")) {
      return c.json<ErrorResponse>(
        {
          success: false,
          error: {
            message: "Veritabanı bağlantı hatası",
            code: "DB_CONNECTION_ERROR",
          },
          timestamp,
        },
        503
      );
    }

    // Generic MongoDB error
    return c.json<ErrorResponse>(
      {
        success: false,
        error: {
          message: "Veritabanı hatası",
          code: "DATABASE_ERROR",
          details:
            process.env.NODE_ENV === "development"
              ? mongoError.message
              : undefined,
        },
        timestamp,
      },
      500
    );
  }

  // 5. Generic errors
  return c.json<ErrorResponse>(
    {
      success: false,
      error: {
        message:
          process.env.NODE_ENV === "development"
            ? err.message
            : "Bir hata oluştu",
        code: "INTERNAL_SERVER_ERROR",
        details: process.env.NODE_ENV === "development" ? err.stack : undefined,
      },
      timestamp,
    },
    500
  );
};
