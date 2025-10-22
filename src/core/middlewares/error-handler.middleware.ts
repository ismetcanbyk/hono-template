import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import { env, logger } from "@/config";

interface ErrorResponse {
	success: false;
	error: {
		code: string;
		message: string;
		details?: unknown;
	};
	timestamp: string;
}

/**
 * Global error handler middleware
 * Handles different error types: HTTPException, ZodError, MongoDB errors, and generic errors
 */
export function errorHandlerMiddleware(error: Error, c: Context): Response {
	const timestamp = new Date().toISOString();

	// Log the error
	logger.error(
		{
			err: error,
			path: c.req.path,
			method: c.req.method,
		},
		"Error occurred",
	);

	// Handle Hono HTTPException
	if (error instanceof HTTPException) {
		const statusCode = error.status;
		const errorResponse: ErrorResponse = {
			success: false,
			error: {
				code: `HTTP_${statusCode}`,
				message: error.message || "An HTTP error occurred",
				details: error.cause,
			},
			timestamp,
		};

		return c.json(errorResponse, statusCode);
	}

	// Handle Zod Validation Errors
	if (error instanceof ZodError) {
		const errorResponse: ErrorResponse = {
			success: false,
			error: {
				code: "VALIDATION_ERROR",
				message: "Request validation failed",
				details: error.issues.map((err) => ({
					path: err.path.join("."),
					message: err.message,
					code: err.code,
				})),
			},
			timestamp,
		};

		return c.json(errorResponse, 400);
	}

	// Handle MongoDB Errors
	if (error.name === "MongoError" || error.name.includes("Mongo")) {
		const mongoError = error as Error & {
			code?: number;
			keyPattern?: Record<string, unknown>;
			errors?: Record<string, unknown>;
			kind?: string;
			path?: string;
			value?: unknown;
		};

		// Duplicate key error
		if (mongoError.code === 11000) {
			const errorResponse: ErrorResponse = {
				success: false,
				error: {
					code: "DUPLICATE_KEY_ERROR",
					message: "A record with this value already exists",
					details: mongoError.keyPattern,
				},
				timestamp,
			};

			return c.json(errorResponse, 409);
		}

		// Validation error
		if (mongoError.name === "ValidationError") {
			const errorResponse: ErrorResponse = {
				success: false,
				error: {
					code: "DATABASE_VALIDATION_ERROR",
					message: "Database validation failed",
					details: mongoError.errors,
				},
				timestamp,
			};

			return c.json(errorResponse, 400);
		}

		// Cast error (invalid ObjectId, etc.)
		if (mongoError.name === "CastError") {
			const errorResponse: ErrorResponse = {
				success: false,
				error: {
					code: "INVALID_ID_FORMAT",
					message: `Invalid ${mongoError.kind} format for field '${mongoError.path}'`,
					details: {
						path: mongoError.path,
						value: mongoError.value,
					},
				},
				timestamp,
			};

			return c.json(errorResponse, 400);
		}

		// Generic MongoDB error
		const errorResponse: ErrorResponse = {
			success: false,
			error: {
				code: "DATABASE_ERROR",
				message: "A database error occurred",
				details: env.NODE_ENV === "development" ? mongoError.message : undefined,
			},
			timestamp,
		};

		return c.json(errorResponse, 500);
	}

	// Handle generic errors
	const errorResponse: ErrorResponse = {
		success: false,
		error: {
			code: "INTERNAL_SERVER_ERROR",
			message: error.message || "An unexpected error occurred",
			details:
				env.NODE_ENV === "development"
					? {
							stack: error.stack,
							name: error.name,
						}
					: undefined,
		},
		timestamp,
	};

	return c.json(errorResponse, 500);
}
