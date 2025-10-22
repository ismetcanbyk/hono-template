import { cors } from "hono/cors";

/**
 * CORS middleware configuration
 * Allows cross-origin requests with proper headers
 */
export function corsMiddleware() {
	return cors({
		origin: "*", // In production, replace with specific origins
		allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		exposeHeaders: ["Content-Length", "Content-Type", "Authorization"],
		credentials: true,
		maxAge: 86400, // 24 hours
	});
}
