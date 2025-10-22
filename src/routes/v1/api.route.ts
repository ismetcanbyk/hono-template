import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { AppEnv } from "@/core/types/app.types";
import { TestSchema } from "@/schemas/test.schema";

/**
 * API routes for v1
 * General API endpoints for testing and validation
 */
const apiRoutes = new Hono<AppEnv>();

/**
 * POST /api/v1/validate-schema
 * Schema validation test endpoint
 */
apiRoutes.post("/validate-schema", zValidator("json", TestSchema), (c) => {
	return c.json({
		success: true,
		message: "Schema validated successfully",
		data: c.req.valid("json"),
	});
});

export default apiRoutes;
