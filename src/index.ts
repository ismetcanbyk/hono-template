import { createApp } from "./app";
import { createAuthConfig, database } from "./config";
import { createServer } from "./server";

/**
 * Application entry point
 * Initializes dependencies and starts the server
 */
async function bootstrap() {
	try {
		console.info("🔧 Starting application...");

		// 1. Connect to database
		console.info("📦 Connecting to database...");
		await database.connect();

		// 2. Initialize authentication
		console.info("🔐 Initializing authentication...");
		const auth = await createAuthConfig();

		// 3. Create application
		console.info("🏗️  Creating application...");
		const app = createApp(auth);

		// 4. Start server
		console.info("🚀 Starting server...");
		const server = createServer();
		server.start(app);
	} catch (error) {
		console.error("❌ Failed to start application:", error);
		process.exit(1);
	}
}

// Start the application
bootstrap();
