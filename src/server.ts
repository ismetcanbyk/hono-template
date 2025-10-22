import { serve } from "@hono/node-server";
import type { Hono } from "hono";
import { database, env } from "./config";
import type { AppEnv } from "./core/types/app.types";

type ServerInstance = ReturnType<typeof serve>;

/**
 * Server lifecycle manager
 * Handles server startup, shutdown, and graceful termination
 */
export class Server {
	private server: ServerInstance | null = null;

	/**
	 * Starts the HTTP server
	 * @param app - Hono application instance
	 */
	start(app: Hono<AppEnv>): void {
		this.server = serve({
			fetch: app.fetch,
			port: env.PORT,
		});

		console.info(`🚀 Server started on http://localhost:${env.PORT}`);
		console.info(`📊 Metrics available at http://localhost:${env.PORT}/metrics`);
		console.info(`🏥 Health check at http://localhost:${env.PORT}/health`);
		console.info(`📚 API v1 at http://localhost:${env.PORT}/api/v1`);

		this.setupGracefulShutdown();
	}

	/**
	 * Sets up graceful shutdown handlers
	 * Ensures clean shutdown on SIGINT and SIGTERM
	 */
	private setupGracefulShutdown(): void {
		const shutdown = async (signal: string) => {
			console.info(`\n⚠️  ${signal} received, starting graceful shutdown...`);

			try {
				// Close server
				if (this.server) {
					this.server.close();
					console.info("✅ Server closed");
				}

				// Disconnect database
				await database.disconnect();

				console.info("✅ Graceful shutdown completed");
				process.exit(0);
			} catch (error) {
				console.error("❌ Error during shutdown:", error);
				process.exit(1);
			}
		};

		// Handle shutdown signals
		process.on("SIGINT", () => {
			shutdown("SIGINT").catch((error) => {
				console.error("Error during SIGINT shutdown:", error);
				process.exit(1);
			});
		});

		process.on("SIGTERM", () => {
			shutdown("SIGTERM").catch((error) => {
				console.error("Error during SIGTERM shutdown:", error);
				process.exit(1);
			});
		});

		// Handle uncaught errors
		process.on("uncaughtException", (error) => {
			console.error("❌ Uncaught Exception:", error);
			shutdown("uncaughtException").catch((err) => {
				console.error("Error during uncaughtException shutdown:", err);
				process.exit(1);
			});
		});

		process.on("unhandledRejection", (reason, promise) => {
			console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
			shutdown("unhandledRejection").catch((error) => {
				console.error("Error during unhandledRejection shutdown:", error);
				process.exit(1);
			});
		});
	}
}

/**
 * Creates and returns a new server instance
 */
export function createServer(): Server {
	return new Server();
}
