import { serve } from "@hono/node-server";
import { disconnect } from "./database/db.js";
import { env } from "./env.js";
import type { Hono } from "hono";
import type { AppEnv } from "./types/app.js";

export function startServer(app: Hono<AppEnv>) {
  const gracefulShutdown = async () => {
    console.log("\n🛑 Sunucu kapatılıyor...");
    await disconnect();
    process.exit(0);
  };

  process.on("SIGINT", async () => gracefulShutdown());
  process.on("SIGTERM", async () => gracefulShutdown());

  serve(
    {
      fetch: app.fetch,
      port: env.PORT,
    },
    (info) => {
      console.log(`🚀 Server is running on http://localhost:${info.port}`);
    },
  );
}
