import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import "dotenv/config";

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    PORT: z.number().default(3000),
    BETTER_AUTH_SECRET: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().default(""),
    GOOGLE_CLIENT_SECRET: z.string().default(""),
    FACEBOOK_CLIENT_ID: z.string().default(""),
    FACEBOOK_CLIENT_SECRET: z.string().default(""),
    LOG_LEVEL: z.string().default("info"),
    NODE_ENV: z.enum(["development", "production"]).default("development"),
  },
  runtimeEnv: process.env,
});
