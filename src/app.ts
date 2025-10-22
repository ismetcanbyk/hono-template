import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import type { Auth } from "@/config";
import {
	authMiddleware,
	corsMiddleware,
	errorHandlerMiddleware,
	etagMiddleware,
	loggerMiddleware,
	notFoundHandler,
	rateLimitMiddleware,
	registerMetrics,
	secureHeadersMiddleware,
} from "@/core/middlewares";
import type { AppEnv } from "@/core/types/app.types";
import { createRoutes } from "@/routes";

/**
 * Application factory
 * Creates and configures the Hono application instance
 *
 * @param auth - Better Auth instance
 * @returns Configured Hono application
 */
export function createApp(auth: Auth) {
	const app = new Hono<AppEnv>();

	// Register global middleware (order matters!)
	// 1. Metrics (should be first to capture all requests)
	app.use("*", registerMetrics);

	// 2. Logging
	app.use("*", loggerMiddleware());

	// 3. Security middleware
	app.use("*", etagMiddleware());
	app.use("*", secureHeadersMiddleware());

	// 4. CORS (before routes)
	app.use("/api/*", corsMiddleware());

	// 5. Rate limiting
	app.use("*", rateLimitMiddleware());

	// 6. Pretty JSON formatting
	app.use("*", prettyJSON());

	// 7. Authentication (must be before routes that need it)
	app.use("*", authMiddleware(auth));

	// Register routes
	app.route("/", createRoutes(auth));

	// 404 Not Found handler (must be after routes, before error handler)
	app.notFound(notFoundHandler);

	// Error handler (must be last)
	app.onError(errorHandlerMiddleware);

	return app;
}
