import { serve } from "@hono/node-server";
import { prometheus } from "@hono/prometheus";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { etag } from "hono/etag";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { secureHeaders } from "hono/secure-headers";
import { rateLimiter } from "hono-rate-limiter";
import { auth, type Session, type User } from "./auth.js";
import { connect, disconnect, ping } from "./database/db.js";
import { env } from "./env.js";
import { TestSchema } from "./schema/test.schema.js";

type AppEnv = {
	Variables: {
		user: User | null;
		session: Session | null;
	};
};

const app = new Hono<AppEnv>();

await connect();

app.use(
	"/api/*",
	cors({
		origin: "*",
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		exposeHeaders: ["Content-Length", "Content-Type", "Authorization"],
		credentials: true,
	}),
);

const { printMetrics, registerMetrics } = prometheus();

app.use("*", async (c, next) => {
	const session = await auth.api.getSession({ headers: c.req.raw.headers });

	c.set("user", session?.user ?? null);
	c.set("session", session?.session ?? null);

	await next();
});

app.use("*", registerMetrics);
app.get("/metrics", printMetrics);
app.get("/", (c) => c.text("foo"));

// Test Schema Validation
app.post("/api/validate-schema", zValidator("json", TestSchema), (c) => {
	return c.json({
		message: "Schema validated",
		data: c.req.valid("json"),
	});
});

app.get("/api/me", (c) => {
	const user = c.get("user");
	const session = c.get("session");

	if (!user || !session) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	return c.json({
		user: {
			id: user.id,
			email: user.email,
			name: user.name,
		},
		session: {
			id: session.id,
			expiresAt: session.expiresAt,
		},
	});
});

app.use(
	etag(),
	logger(),
	prettyJSON(),
	secureHeaders(),
	rateLimiter({
		windowMs: 15 * 60 * 1000,
		limit: 100,
		keyGenerator: (c) =>
			c.req.header("Authorization") ||
			c.req.header("X-Forwarded-For") ||
			c.req.header("User-Agent") ||
			"anonymous",
	}),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.get("/health", async (c) => {
	const isDbHealthy = await ping();

	if (!isDbHealthy) {
		return c.json(
			{
				status: "unhealthy",
				database: "disconnected",
			},
			503,
		);
	}

	return c.json({
		status: "healthy",
		database: "connected",
	});
});

process.on("SIGINT", async () => {
	console.log("\n🛑 Sunucu kapatılıyor...");
	await disconnect();
	process.exit(0);
});

process.on("SIGTERM", async () => {
	console.log("\n🛑 Sunucu kapatılıyor...");
	await disconnect();
	process.exit(0);
});

serve(
	{
		fetch: app.fetch,
		port: env.PORT,
	},
	(info) => {
		console.log(`🚀 Server is running on http://localhost:${info.port}`);
	},
);
