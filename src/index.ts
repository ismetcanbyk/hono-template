import { Hono } from "hono";
import { connect } from "./database/db.js";
import {
	setupAuth,
	setupCORS,
	setupErrorHandler,
	setupGlobalMiddleware,
} from "./middleware/index.js";
import routes from "./routes/index.js";
import { startServer } from "./server.js";
import type { AppEnv } from "./types/app.js";

const app = new Hono<AppEnv>();

await connect();

setupGlobalMiddleware(app);
setupCORS(app);
setupAuth(app);

app.route("/", routes);

// Error handler should be registered after routes
setupErrorHandler(app);

startServer(app);
