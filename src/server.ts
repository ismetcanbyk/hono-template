import { serve } from "@hono/node-server";
import type { Hono } from "hono";
import { disconnect } from "./database/db.js";
import { env } from "./env.js";
import type { AppEnv } from "./types/app.js";

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
