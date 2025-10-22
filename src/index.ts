import { createApp } from "@/app";
import { createAuthConfig, database, logger } from "@/config";
import { createServer } from "@/server";

/**
 * Application entry point
 * Initializes dependencies and starts the server
 */
async function bootstrap() {
	try {
		logger.info("🔧 Starting application...");

		// 1. Connect to database
		logger.info("📦 Connecting to database...");
		await database.connect();

		// 2. Initialize authentication
		logger.info("🔐 Initializing authentication...");
		const auth = await createAuthConfig();

		// 3. Create application
		logger.info("🏗️  Creating application...");
		const app = createApp(auth);

		// 4. Start server
		logger.info("🚀 Starting server...");
		const server = createServer();
		server.start(app);
	} catch (error) {
		logger.error({ err: error }, "❌ Failed to start application");
		process.exit(1);
	}
}

// Start the application
bootstrap();
