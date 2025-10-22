import { Hono } from "hono";
import { printMetrics } from "@/middleware";
import apiRoutes from "@/routes/api";
import authRoutes from "@/routes/auth";
import exampleRoutes from "@/routes/example";
import healthRoutes from "@/routes/health";
import type { AppEnv } from "@/types/app";

const routes = new Hono<AppEnv>();

routes.get("/", (c) => c.text("foo"));
routes.get("/metrics", printMetrics);

routes.route("/", healthRoutes);
routes.route("/api", apiRoutes);
routes.route("/api", authRoutes);
routes.route("/examples", exampleRoutes);

export default routes;
