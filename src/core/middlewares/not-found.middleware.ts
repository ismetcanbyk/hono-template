import type { Context } from "hono";
import type { NotFoundHandler } from "hono/types";

import { logger } from "@/config";
import type { AppEnv } from "@/core/types/app.types";

/**
 * Global 404 Not Found Handler
 * Provides detailed information about the missing resource
 * and suggestions for available endpoints
 */
export const notFoundHandler: NotFoundHandler<AppEnv> = (c: Context) => {
	const { method, url } = c.req;
	const path = new URL(url).pathname;

	// Log the 404 error
	logger.warn(
		{
			method,
			path,
			url,
			ip: c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown",
			userAgent: c.req.header("user-agent") || "unknown",
		},
		`404 Not Found: ${method} ${path}`,
	);

	// Prepare response
	return c.json(
		{
			error: "Not Found",
			statusCode: 404,
			message: `The requested resource '${path}' was not found on this server.`,
			details: {
				method,
				path,
				timestamp: new Date().toISOString(),
			},
		},
		404,
	);
};
