import { Hono } from "hono";
import { ping } from "../database/db.js";
import type { AppEnv } from "../types/app.ts";

const health = new Hono<AppEnv>();

health.get("/health", async (c) => {
  const isDbHealthy = await ping();

  if (!isDbHealthy) {
    return c.json(
      {
        status: "unhealthy",
        database: "disconnected",
      },
      503
    );
  }

  return c.json({
    status: "healthy",
    database: "connected",
  });
});

export default health;
