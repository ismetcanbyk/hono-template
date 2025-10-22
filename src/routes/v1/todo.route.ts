import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { ObjectId } from "mongodb";
import { createAuthConfig } from "@/config/auth.config";
import { requireAuth } from "@/core/middlewares/auth.middleware";
import type { AppEnv } from "@/core/types/app.types";
import { createTodoSchema, todoIdParamSchema, updateTodoSchema } from "@/schemas/todo.schema";
import * as todoService from "@/services/todo.service";

const todoRoutes = new Hono<AppEnv>();

// Apply auth middleware to all routes
todoRoutes.use("*", requireAuth(createAuthConfig));

// Get all todos
todoRoutes.get("/", async (c) => {
	const user = c.get("user");
	const todos = await todoService.findTodosByUserId(user.id);
	return c.json({ success: true, data: todos });
});

// Get single todo
todoRoutes.get("/:id", zValidator("param", todoIdParamSchema), async (c) => {
	const user = c.get("user");
	const { id } = c.req.valid("param");

	const todo = await todoService.findTodoById(new ObjectId(id), user.id);

	if (!todo) {
		throw new HTTPException(404, { message: "Todo not found" });
	}

	return c.json({ success: true, data: todo });
});

// Create new todo
todoRoutes.post("/", zValidator("json", createTodoSchema), async (c) => {
	const user = c.get("user");
	const body = c.req.valid("json");

	const todo = await todoService.createTodo(user.id, body);

	return c.json({ success: true, data: todo }, 201);
});

// Update todo
todoRoutes.patch(
	"/:id",
	zValidator("param", todoIdParamSchema),
	zValidator("json", updateTodoSchema),
	async (c) => {
		const user = c.get("user");
		const { id } = c.req.valid("param");
		const body = c.req.valid("json");

		const todo = await todoService.updateTodo(new ObjectId(id), user.id, body);

		if (!todo) {
			throw new HTTPException(404, { message: "Todo not found" });
		}

		return c.json({ success: true, data: todo });
	},
);

// Delete todo
todoRoutes.delete("/:id", zValidator("param", todoIdParamSchema), async (c) => {
	const user = c.get("user");
	const { id } = c.req.valid("param");

	const deleted = await todoService.deleteTodo(new ObjectId(id), user.id);

	if (!deleted) {
		throw new HTTPException(404, { message: "Todo not found" });
	}

	return c.json({ success: true, message: "Todo deleted successfully" });
});

export default todoRoutes;
