import { Hono } from "hono";

import { database } from "@/config";
import type { AppEnv } from "@/core/types/app.types";

/**
 * Health check routes
 * Used for monitoring and load balancer health checks
 */
const healthRoutes = new Hono<AppEnv>();

/**
 * GET /health
 * Returns health status of the application and its dependencies
 */
healthRoutes.get("/health", async (c) => {
	const isDbHealthy = await database.ping();

	if (!isDbHealthy) {
		return c.json(
			{
				status: "unhealthy",
				timestamp: new Date().toISOString(),
				checks: {
					database: "disconnected",
				},
			},
			503,
		);
	}

	return c.json({
		status: "healthy",
		timestamp: new Date().toISOString(),
		checks: {
			database: "connected",
		},
	});
});

/**
 * GET /health/liveness
 * Kubernetes liveness probe - checks if app is running
 */
healthRoutes.get("/health/liveness", (c) => {
	return c.json({ status: "alive" });
});

/**
 * GET /health/readiness
 * Kubernetes readiness probe - checks if app is ready to serve traffic
 */
healthRoutes.get("/health/readiness", async (c) => {
	const isDbHealthy = await database.ping();

	if (!isDbHealthy) {
		return c.json({ status: "not ready", reason: "database unavailable" }, 503);
	}

	return c.json({ status: "ready" });
});

export default healthRoutes;
