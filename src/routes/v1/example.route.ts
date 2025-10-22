import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import type { AppEnv } from "@/core/types/app.types";

/**
 * Example routes demonstrating error handling
 * These routes showcase different error scenarios for testing
 */
const exampleRoutes = new Hono<AppEnv>();

/**
 * POST /api/v1/examples/validate
 * Example: Zod validation error
 */
exampleRoutes.post("/validate", async (c) => {
	const schema = z.object({
		email: z.email(),
		age: z.number().min(18),
		username: z.string().min(3).max(20),
	});

	const body = await c.req.json();
	const result = schema.parse(body); // Will throw ZodError if validation fails

	return c.json({ success: true, data: result });
});

/**
 * GET /api/v1/examples/unauthorized
 * Example: HTTP 401 Unauthorized exception
 */
exampleRoutes.get("/unauthorized", (_c) => {
	throw new HTTPException(401, {
		message: "You must be logged in to access this resource",
	});
});

/**
 * GET /api/v1/examples/forbidden
 * Example: HTTP 403 Forbidden exception with custom response
 */
exampleRoutes.get("/forbidden", (_c) => {
	const errorResponse = new Response("Forbidden: Insufficient permissions", {
		status: 403,
		headers: {
			"X-Error-Code": "INSUFFICIENT_PERMISSIONS",
		},
	});

	throw new HTTPException(403, { res: errorResponse });
});

/**
 * GET /api/v1/examples/error
 * Example: Generic synchronous error
 */
exampleRoutes.get("/error", (_c) => {
	throw new Error("Something went wrong!");
});

/**
 * GET /api/v1/examples/async-error
 * Example: Asynchronous error
 */
exampleRoutes.get("/async-error", async (_c) => {
	await new Promise((resolve) => setTimeout(resolve, 100));
	throw new Error("Async operation failed");
});

export default exampleRoutes;
