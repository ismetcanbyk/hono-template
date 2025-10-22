import { Hono } from "hono";
import { connect } from "@/config/database/db";
import { setupAuth, setupCORS, setupErrorHandler, setupGlobalMiddleware } from "@/middleware";
import routes from "@/routes";
import { startServer } from "@/server";
import type { AppEnv } from "@/types/app";

const app = new Hono<AppEnv>();

await connect();

setupGlobalMiddleware(app);
setupCORS(app);
setupAuth(app);

app.route("/", routes);

// Error handler should be registered after routes
setupErrorHandler(app);

startServer(app);
