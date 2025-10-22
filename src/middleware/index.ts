import { prometheus } from "@hono/prometheus";
import type { Hono } from "hono";
import { cors } from "hono/cors";
import { etag } from "hono/etag";
import { prettyJSON } from "hono/pretty-json";
import { secureHeaders } from "hono/secure-headers";
import { rateLimiter } from "hono-rate-limiter";
import { auth } from "../auth.js";
import type { AppEnv } from "../types/app.js";
import { globalErrorHandler } from "./error-handler.js";
import { pinoLogger } from "./pino-logger.js";

export const { printMetrics, registerMetrics } = prometheus();

export function setupGlobalMiddleware(app: Hono<AppEnv>) {
	app.use("*", registerMetrics);

	app.use("*", etag());
	app.use("*", pinoLogger());
	app.use("*", prettyJSON());
	app.use("*", secureHeaders());
	app.use(
		"*",
		rateLimiter({
			windowMs: 15 * 60 * 1000,
			limit: 100,
			keyGenerator: (c) =>
				c.req.header("Authorization") ||
				c.req.header("X-Forwarded-For") ||
				c.req.header("User-Agent") ||
				"anonymous",
		}),
	);
}

export function setupCORS(app: Hono<AppEnv>) {
	app.use(
		"/api/*",
		cors({
			origin: "*",
			allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
			allowHeaders: ["Content-Type", "Authorization"],
			exposeHeaders: ["Content-Length", "Content-Type", "Authorization"],
			credentials: true,
		}),
	);
}

export function setupAuth(app: Hono<AppEnv>) {
	app.use("*", async (c, next) => {
		const session = await auth.api.getSession({ headers: c.req.raw.headers });
		c.set("user", session?.user ?? null);
		c.set("session", session?.session ?? null);
		await next();
	});
}

export function setupErrorHandler(app: Hono<AppEnv>) {
	app.onError(globalErrorHandler);
}

export { globalErrorHandler };
