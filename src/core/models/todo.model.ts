import type { z } from "zod";
import type {
	createTodoInputSchema,
	todoDocumentSchema,
	todoResponseSchema,
	updateTodoSchema,
} from "@/schemas/todo.schema";

/**
 * All types are inferred from Zod schemas - no manual type definitions
 */
export type TodoDocument = z.infer<typeof todoDocumentSchema>;
export type CreateTodoInput = z.infer<typeof createTodoInputSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
export type TodoResponse = z.infer<typeof todoResponseSchema>;
