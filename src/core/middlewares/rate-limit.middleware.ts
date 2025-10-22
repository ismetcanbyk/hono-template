import { rateLimiter } from "hono-rate-limiter";

/**
 * Rate limiting middleware
 * Prevents abuse by limiting requests per time window
 */
export function rateLimitMiddleware() {
	return rateLimiter({
		windowMs: 15 * 60 * 1000, // 15 minutes
		limit: 100, // Max 100 requests per window
		standardHeaders: "draft-7",
		keyGenerator: (c) =>
			c.req.header("Authorization") ||
			c.req.header("X-Forwarded-For") ||
			c.req.header("X-Real-IP") ||
			c.req.header("User-Agent") ||
			"anonymous",
	});
}
