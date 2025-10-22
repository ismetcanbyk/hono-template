import { z } from "zod";

/**
 * Test schema for validation examples
 */
export const TestSchema = z.object({
	name: z.string().min(1, "Name is required"),
	age: z.number().min(1, "Age must be at least 1"),
});

export type TestSchemaType = z.infer<typeof TestSchema>;
