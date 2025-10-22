import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { TestSchema } from "@/schema/test.schema";
import type { AppEnv } from "@/types/app";

const api = new Hono<AppEnv>();

// Schema validation for test endpoint
api.post("/validate-schema", zValidator("json", TestSchema), (c) => {
	return c.json({
		message: "Schema validated",
		data: c.req.valid("json"),
	});
});

export default api;
