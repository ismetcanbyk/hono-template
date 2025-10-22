import { pinoLogger } from "hono-pino";
import { logger } from "@/config";

/**
 * Pino logger middleware for request/response logging
 * Uses the shared application logger instance
 */
export function loggerMiddleware() {
	return pinoLogger({
		pino: logger,
	});
}
