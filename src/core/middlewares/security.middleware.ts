import { etag } from "hono/etag";
import { secureHeaders } from "hono/secure-headers";

/**
 * Security middleware - ETag for caching
 */
export function etagMiddleware() {
	return etag();
}

/**
 * Security middleware - Secure headers
 * Adds security headers to prevent common vulnerabilities
 */
export function secureHeadersMiddleware() {
	return secureHeaders();
}
