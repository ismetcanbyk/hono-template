import { serve } from "@hono/node-server";
import type { Hono } from "hono";
import { disconnect } from "@/config/database/db";
import { env } from "@/config/environment-variables";
import type { AppEnv } from "@/types/app";

export function startServer(app: Hono<AppEnv>) {
	const gracefulShutdown = async () => {
		await disconnect();
		process.exit(0);
	};

	process.on("SIGINT", async () => gracefulShutdown());
	process.on("SIGTERM", async () => gracefulShutdown());

	serve({
		fetch: app.fetch,
		port: env.PORT,
	});
}
