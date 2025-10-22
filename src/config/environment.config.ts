import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import "dotenv/config";

/**
 * Environment configuration using t3-oss/env-core
 * Provides type-safe environment variables with runtime validation
 */
export const env = createEnv({
	server: {
		// Server Configuration
		NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
		PORT: z.coerce.number().default(3000),
		LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),

		// Database Configuration
		DATABASE_URL: z.url(),

		// Authentication Configuration
		BETTER_AUTH_SECRET: z.string(),

		// OAuth Providers (Optional)
		GOOGLE_CLIENT_ID: z.string().optional().default(""),
		GOOGLE_CLIENT_SECRET: z.string().optional().default(""),
		FACEBOOK_CLIENT_ID: z.string().optional().default(""),
		FACEBOOK_CLIENT_SECRET: z.string().optional().default(""),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});

export type Environment = typeof env;
