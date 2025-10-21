import z from "zod";

export const TestSchema = z.object({
	name: z.string().min(1),
	age: z.number().min(1),
});

export type TestSchemaType = z.infer<typeof TestSchema>;
