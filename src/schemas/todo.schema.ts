import { ObjectId } from "mongodb";
import { z } from "zod";

/**
 * Custom Zod type for MongoDB ObjectId
 */
const objectIdSchema = z.instanceof(ObjectId);

/**
 * Base todo document schema (as stored in MongoDB)
 */
export const todoDocumentSchema = z.object({
	_id: objectIdSchema,
	userId: z.string(),
	title: z.string(),
	description: z.string(),
	completed: z.boolean(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

/**
 * Schema for creating a new todo (API input)
 */
export const createTodoSchema = z.object({
	title: z
		.string()
		.min(1, "Title is required")
		.max(200, "Title must be 200 characters or less")
		.trim(),
	description: z
		.string()
		.min(1, "Description is required")
		.max(1000, "Description must be 1000 characters or less")
		.trim(),
});

/**
 * Schema for creating a todo with userId (service input)
 */
export const createTodoInputSchema = createTodoSchema.extend({
	userId: z.string(),
});

/**
 * Schema for updating a todo (API input)
 */
export const updateTodoSchema = z.object({
	title: z
		.string()
		.min(1, "Title must not be empty")
		.max(200, "Title must be 200 characters or less")
		.trim()
		.optional(),
	description: z
		.string()
		.min(1, "Description must not be empty")
		.max(1000, "Description must be 1000 characters or less")
		.trim()
		.optional(),
	completed: z.boolean().optional(),
});

/**
 * Schema for todo ID parameter
 */
export const todoIdSchema = z.object({
	id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid todo ID format"),
});

/**
 * API response schema
 */
export const todoResponseSchema = z.object({
	id: z.string(),
	userId: z.string(),
	title: z.string(),
	description: z.string(),
	completed: z.boolean(),
	createdAt: z.string(),
	updatedAt: z.string(),
});
