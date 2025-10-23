import type { Context, Next } from "hono";
import type { AppEnv } from "@/core/types/app.types";

/**
 * Middleware that requires user to be authenticated
 * Returns 401 if user is not logged in
 * Use this after authMiddleware to protect routes
 */
export function requireAuth() {
	return async (c: Context<AppEnv>, next: Next) => {
		const user = c.get("user");
		const session = c.get("session");

		if (!user || !session) {
			return c.json(
				{
					success: false,
					error: "Unauthorized",
					message: "You must be logged in to access this resource",
				},
				401,
			);
		}

		await next();
	};
}
