import { Hono } from "hono";

import type { Auth } from "@/config";
import { printMetrics } from "@/core/middlewares";
import type { AppEnv } from "@/core/types/app.types";
import healthRoutes from "@/routes/health.route";
import { createV1Routes } from "@/routes/v1";
import { createAuthRoutes } from "@/routes/v1/auth.route";

/**
 * Main routes factory
 * Aggregates all application routes
 */
export function createRoutes(auth: Auth) {
	const routes = new Hono<AppEnv>();

	// Root endpoint
	routes.get("/", (c) =>
		c.json({
			message: "Welcome to Hono API",
			version: "1.0.0",
			endpoints: {
				health: "/health",
				metrics: "/metrics",
				auth: "/api/auth",
				api: "/api/v1",
			},
		}),
	);

	// Metrics endpoint (Prometheus)
	routes.get("/metrics", printMetrics);

	// Health check routes
	routes.route("/", healthRoutes);

	// Auth routes (no versioning - serves all API versions)
	routes.route("/api", createAuthRoutes(auth));

	// API v1 routes
	routes.route("/api/v1", createV1Routes());

	return routes;
}
