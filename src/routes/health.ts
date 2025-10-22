import { Hono } from "hono";
import { ping } from "@/config/database/db";
import type { AppEnv } from "@/types/app";

const health = new Hono<AppEnv>();

health.get("/health", async (c) => {
	const isDbHealthy = await ping();

	if (!isDbHealthy) {
		return c.json(
			{
				status: "unhealthy",
				database: "disconnected",
			},
			503,
		);
	}

	return c.json({
		status: "healthy",
		database: "connected",
	});
});

export default health;
