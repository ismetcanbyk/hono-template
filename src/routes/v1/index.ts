import { Hono } from "hono";

import type { AppEnv } from "@/core/types/app.types";
import todoRoutes from "@/routes/v1/todo.route";

/**
 * V1 API routes aggregator
 * Combines all v1 routes under /api/v1 prefix
 * Note: Auth routes are mounted at top level (/api/auth) to serve all API versions
 */
export function createV1Routes() {
	const v1Routes = new Hono<AppEnv>();

	// Mount route groups
	v1Routes.route("/todos", todoRoutes);

	return v1Routes;
}
