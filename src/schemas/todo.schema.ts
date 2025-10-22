import { z } from "zod";

export const createTodoSchema = z.object({
	title: z.string().min(1, "Title is required").max(200, "Title too long"),
	description: z.string().max(1000, "Description too long").optional(),
});

export const updateTodoSchema = z
	.object({
		title: z.string().min(1, "Title cannot be empty").max(200, "Title too long").optional(),
		description: z.string().max(1000, "Description too long").optional(),
		completed: z.boolean().optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "At least one field must be provided",
	});

export const todoIdParamSchema = z.object({
	id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId format"),
});

// Type inference
export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
export type TodoIdParam = z.infer<typeof todoIdParamSchema>;
