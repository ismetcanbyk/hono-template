import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import type { AppEnv } from "../types/app.js";

const example = new Hono<AppEnv>();

// Example: Zod validation error
example.post("/validate", async (c) => {
	const schema = z.object({
		email: z.string().email(),
		age: z.number().min(18),
		username: z.string().min(3).max(20),
	});

	const body = await c.req.json();
	const result = schema.parse(body); // Will throw ZodError if validation fails

	return c.json({ success: true, data: result });
});

// Example: HTTP exception
example.get("/unauthorized", (_c) => {
	throw new HTTPException(401, {
		message: "You must be logged in to access this resource",
	});
});

// Example: HTTP exception with custom response
example.get("/forbidden", (_c) => {
	const errorResponse = new Response("Forbidden: Insufficient permissions", {
		status: 403,
		headers: {
			"X-Error-Code": "INSUFFICIENT_PERMISSIONS",
		},
	});

	throw new HTTPException(403, { res: errorResponse });
});

// Example: Generic error
example.get("/error", (_c) => {
	throw new Error("Something went wrong!");
});

// Example: Async error
example.get("/async-error", async (_c) => {
	await new Promise((resolve) => setTimeout(resolve, 100));
	throw new Error("Async operation failed");
});

export default example;
