import { Hono } from "hono";
import { auth } from "../auth.js";
import type { AppEnv } from "../types/app.js";

const authRoutes = new Hono<AppEnv>();

authRoutes.on(["POST", "GET"], "/auth/*", (c) => auth.handler(c.req.raw));

export default authRoutes;
