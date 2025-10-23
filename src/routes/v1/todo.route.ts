import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ObjectId } from "mongodb";
import { logger } from "@/config/logger.config";
import { requireAuth } from "@/core/middlewares";
import {
	createTodo,
	deleteCompletedTodos,
	deleteTodo,
	getTodoById,
	getTodosByUserId,
	toggleTodoCompletion,
	transformTodoToResponse,
	updateTodo,
} from "@/core/services/todo.service";
import type { AppEnv } from "@/core/types/app.types";
import { createTodoSchema, todoIdSchema, updateTodoSchema } from "@/schemas/todo.schema";

/**
 * Todo routes
 * All routes require authentication
 */
const todoRoutes = new Hono<AppEnv>();

// Apply authentication middleware to all todo routes
todoRoutes.use("*", requireAuth());

/**
 * GET /todos - Get all todos for the authenticated user
 */
todoRoutes.get("/", async (c) => {
	try {
		const user = c.get("user");
		if (!user?.id) {
			return c.json(
				{
					success: false,
					error: "Unauthorized",
					message: "User ID not found",
				},
				401,
			);
		}

		const todos = await getTodosByUserId(user.id);
		const transformedTodos = todos.map(transformTodoToResponse);

		return c.json({
			success: true,
			data: transformedTodos,
			meta: {
				total: transformedTodos.length,
			},
		});
	} catch (error) {
		logger.error({ err: error }, "Failed to fetch todos");
		return c.json(
			{
				success: false,
				error: "Internal Server Error",
				message: "Failed to fetch todos",
			},
			500,
		);
	}
});

/**
 * GET /todos/:id - Get a specific todo by ID
 */
todoRoutes.get("/:id", zValidator("param", todoIdSchema), async (c) => {
	try {
		const user = c.get("user");
		if (!user?.id) {
			return c.json(
				{
					success: false,
					error: "Unauthorized",
					message: "User ID not found",
				},
				401,
			);
		}

		const { id } = c.req.valid("param");
		const todo = await getTodoById(new ObjectId(id), user.id);

		if (!todo) {
			return c.json(
				{
					success: false,
					error: "Not Found",
					message: "Todo not found",
				},
				404,
			);
		}

		return c.json({
			success: true,
			data: transformTodoToResponse(todo),
		});
	} catch (error) {
		logger.error({ err: error }, "Failed to fetch todo");
		return c.json(
			{
				success: false,
				error: "Internal Server Error",
				message: "Failed to fetch todo",
			},
			500,
		);
	}
});

/**
 * POST /todos - Create a new todo
 */
todoRoutes.post("/", zValidator("json", createTodoSchema), async (c) => {
	try {
		const user = c.get("user");
		if (!user?.id) {
			return c.json(
				{
					success: false,
					error: "Unauthorized",
					message: "User ID not found",
				},
				401,
			);
		}

		const body = c.req.valid("json");
		const todo = await createTodo({
			userId: user.id,
			...body,
		});

		return c.json(
			{
				success: true,
				data: transformTodoToResponse(todo),
				message: "Todo created successfully",
			},
			201,
		);
	} catch (error) {
		logger.error({ err: error }, "Failed to create todo");
		return c.json(
			{
				success: false,
				error: "Internal Server Error",
				message: "Failed to create todo",
			},
			500,
		);
	}
});

/**
 * PATCH /todos/:id - Update a todo
 */
todoRoutes.patch(
	"/:id",
	zValidator("param", todoIdSchema),
	zValidator("json", updateTodoSchema),
	async (c) => {
		try {
			const user = c.get("user");
			if (!user?.id) {
				return c.json(
					{
						success: false,
						error: "Unauthorized",
						message: "User ID not found",
					},
					401,
				);
			}

			const { id } = c.req.valid("param");
			const body = c.req.valid("json");
			const todo = await updateTodo(new ObjectId(id), user.id, body);

			if (!todo) {
				return c.json(
					{
						success: false,
						error: "Not Found",
						message: "Todo not found",
					},
					404,
				);
			}

			return c.json({
				success: true,
				data: transformTodoToResponse(todo),
				message: "Todo updated successfully",
			});
		} catch (error) {
			logger.error({ err: error }, "Failed to update todo");
			return c.json(
				{
					success: false,
					error: "Internal Server Error",
					message: "Failed to update todo",
				},
				500,
			);
		}
	},
);

/**
 * DELETE /todos/:id - Delete a todo
 */
todoRoutes.delete("/:id", zValidator("param", todoIdSchema), async (c) => {
	try {
		const user = c.get("user");
		if (!user?.id) {
			return c.json(
				{
					success: false,
					error: "Unauthorized",
					message: "User ID not found",
				},
				401,
			);
		}

		const { id } = c.req.valid("param");
		const deleted = await deleteTodo(new ObjectId(id), user.id);

		if (!deleted) {
			return c.json(
				{
					success: false,
					error: "Not Found",
					message: "Todo not found",
				},
				404,
			);
		}

		return c.json({
			success: true,
			message: "Todo deleted successfully",
		});
	} catch (error) {
		logger.error({ err: error }, "Failed to delete todo");
		return c.json(
			{
				success: false,
				error: "Internal Server Error",
				message: "Failed to delete todo",
			},
			500,
		);
	}
});

todoRoutes.post("/:id/toggle", zValidator("param", todoIdSchema), async (c) => {
	try {
		const user = c.get("user");
		if (!user?.id) {
			return c.json(
				{
					success: false,
					error: "Unauthorized",
					message: "User ID not found",
				},
				401,
			);
		}

		const { id } = c.req.valid("param");
		const todo = await toggleTodoCompletion(new ObjectId(id), user.id);

		if (!todo) {
			return c.json(
				{
					success: false,
					error: "Not Found",
					message: "Todo not found",
				},
				404,
			);
		}

		return c.json({
			success: true,
			data: transformTodoToResponse(todo),
			message: "Todo completion toggled successfully",
		});
	} catch (error) {
		logger.error({ err: error }, "Failed to toggle todo");
		return c.json(
			{
				success: false,
				error: "Internal Server Error",
				message: "Failed to toggle todo",
			},
			500,
		);
	}
});

/**
 * DELETE /todos/completed - Delete all completed todos
 */
todoRoutes.delete("/completed/all", async (c) => {
	try {
		const user = c.get("user");
		if (!user?.id) {
			return c.json(
				{
					success: false,
					error: "Unauthorized",
					message: "User ID not found",
				},
				401,
			);
		}

		const deletedCount = await deleteCompletedTodos(user.id);

		return c.json({
			success: true,
			message: `${deletedCount} completed todo(s) deleted successfully`,
			meta: {
				deletedCount,
			},
		});
	} catch (error) {
		logger.error({ err: error }, "Failed to delete completed todos");
		return c.json(
			{
				success: false,
				error: "Internal Server Error",
				message: "Failed to delete completed todos",
			},
			500,
		);
	}
});

export default todoRoutes;
