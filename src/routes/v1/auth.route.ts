import { Hono } from "hono";
import type { Auth } from "@/config";
import type { AppEnv } from "@/core/types/app.types";

/**
 * Authentication routes factory
 * Creates auth routes with Better Auth handler
 * Note: Auth routes are not versioned as they serve all API versions
 */
export function createAuthRoutes(auth: Auth) {
	const authRoutes = new Hono<AppEnv>();

	/**
	 * POST/GET /api/auth/*
	 * Handles all Better Auth endpoints (sign-in, sign-up, sign-out, etc.)
	 */
	authRoutes.on(["POST", "GET"], "/auth/*", (c) => auth.handler(c.req.raw));

	return authRoutes;
}
