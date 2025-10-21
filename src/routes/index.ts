import { Hono } from "hono";
import { printMetrics } from "../middleware/index.js";
import apiRoutes from "./api.js";
import authRoutes from "./auth.js";
import healthRoutes from "./health.js";
import type { AppEnv } from "../types/app.js";

const routes = new Hono<AppEnv>();

routes.get("/", (c) => c.text("foo"));
routes.get("/metrics", printMetrics);

routes.route("/", healthRoutes);
routes.route("/api", apiRoutes);
routes.route("/api", authRoutes);

export default routes;
