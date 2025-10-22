import type { Context, Next } from "hono";
import type { Auth } from "@/config";

/**
 * Authentication middleware factory
 * Attaches user session to context if authenticated
 */
export function authMiddleware(auth: Auth) {
	return async (c: Context, next: Next) => {
		const session = await auth.api.getSession({ headers: c.req.raw.headers });
		c.set("user", session?.user ?? null);
		c.set("session", session?.session ?? null);
		await next();
	};
}
