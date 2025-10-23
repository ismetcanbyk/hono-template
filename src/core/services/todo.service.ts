import { ObjectId } from "mongodb";

import { database } from "@/config/database.config";
import { logger } from "@/config/logger.config";
import type {
	CreateTodoInput,
	TodoDocument,
	TodoResponse,
	UpdateTodoInput,
} from "@/core/models/todo.model";
import { getCollection } from "@/core/utils/mongodb.utils";

/**
 * Get database instance
 */
async function getDb() {
	return await database.getDb();
}

/**
 * Get type-safe todos collection
 */
async function getTodosCollection() {
	const db = await getDb();
	return getCollection<TodoDocument>({ db, collectionName: "todos" });
}

/**
 * Transform MongoDB document to API response format
 */
export function transformTodoToResponse(todo: TodoDocument): TodoResponse {
	return {
		id: todo._id.toString(),
		userId: todo.userId,
		title: todo.title,
		description: todo.description,
		completed: todo.completed,
		createdAt: todo.createdAt.toISOString(),
		updatedAt: todo.updatedAt.toISOString(),
	};
}

/**
 * Create a new todo (with transaction)
 */
export async function createTodo(input: CreateTodoInput) {
	const db = await getDb();
	const session = db.client.startSession();

	try {
		return await session.withTransaction(async () => {
			const collection = await getTodosCollection();
			const now = new Date();
			const todoId = new ObjectId();

			const todoDocument: TodoDocument = {
				_id: todoId,
				userId: input.userId,
				title: input.title,
				description: input.description,
				completed: false,
				createdAt: now,
				updatedAt: now,
			};

			await collection.insertOne(todoDocument, { session });

			logger.info({ todoId }, "Todo created");

			return todoDocument;
		});
	} catch (error) {
		logger.error({ err: error }, "Failed to create todo");
		throw error;
	} finally {
		await session.endSession();
	}
}

/**
 * Get all todos for a user
 */
export async function getTodosByUserId(userId: string) {
	try {
		const collection = await getTodosCollection();
		const todos = await collection.find({ userId }).sort({ createdAt: -1 }).toArray();

		logger.info({ userId, count: todos.length }, "Fetched user todos");
		return todos;
	} catch (error) {
		logger.error({ err: error, userId }, "Failed to fetch todos");
		throw error;
	}
}

/**
 * Get a single todo by ID and user ID
 */
export async function getTodoById(todoId: ObjectId, userId: string) {
	try {
		const collection = await getTodosCollection();
		const todo = await collection.findOne({ _id: todoId, userId });

		logger.info({ todoId, userId, found: !!todo }, "Fetched todo by ID");
		return todo;
	} catch (error) {
		logger.error({ err: error, todoId, userId }, "Failed to fetch todo");
		throw error;
	}
}

/**
 * Update a todo (with transaction)
 */
export async function updateTodo(todoId: ObjectId, userId: string, input: UpdateTodoInput) {
	const db = await getDb();
	const session = db.client.startSession();

	try {
		return await session.withTransaction(async () => {
			const collection = await getTodosCollection();

			const updateDoc: Partial<TodoDocument> = {
				...input,
				updatedAt: new Date(),
			};

			const updateResult = await collection.findOneAndUpdate(
				{ _id: todoId, userId },
				{ $set: updateDoc },
				{ returnDocument: "after", session },
			);

			const todo = updateResult ?? null;

			if (todo) {
				logger.info({ todoId, userId }, "Todo updated");
			} else {
				logger.warn({ todoId, userId }, "Todo not found for update");
			}

			return todo;
		});
	} catch (error) {
		logger.error({ err: error, todoId, userId }, "Failed to update todo");
		throw error;
	} finally {
		await session.endSession();
	}
}

/**
 * Delete a todo (with transaction)
 */
export async function deleteTodo(todoId: ObjectId, userId: string) {
	const db = await getDb();
	const session = db.client.startSession();

	try {
		return await session.withTransaction(async () => {
			const collection = await getTodosCollection();

			const deleteResult = await collection.deleteOne({ _id: todoId, userId }, { session });

			const deleted = deleteResult.deletedCount > 0;

			if (deleted) {
				logger.info({ todoId, userId }, "Todo deleted");
			} else {
				logger.warn({ todoId, userId }, "Todo not found for deletion");
			}

			return deleted;
		});
	} catch (error) {
		logger.error({ err: error, todoId, userId }, "Failed to delete todo");
		throw error;
	} finally {
		await session.endSession();
	}
}

/**
 * Toggle todo completion status (with transaction)
 */
export async function toggleTodoCompletion(todoId: ObjectId, userId: string) {
	const db = await getDb();
	const session = db.client.startSession();

	try {
		return await session.withTransaction(async () => {
			const collection = await getTodosCollection();

			const currentTodo = await collection.findOne({ _id: todoId, userId }, { session });

			if (!currentTodo) {
				logger.warn({ todoId, userId }, "Todo not found for toggle");
				return null;
			}

			const updateResult = await collection.findOneAndUpdate(
				{ _id: todoId, userId },
				{
					$set: {
						completed: !currentTodo.completed,
						updatedAt: new Date(),
					},
				},
				{ returnDocument: "after", session },
			);

			const todo = updateResult ?? null;

			if (todo) {
				logger.info({ todoId, userId, completed: todo.completed }, "Todo completion toggled");
			}

			return todo;
		});
	} catch (error) {
		logger.error({ err: error, todoId, userId }, "Failed to toggle todo");
		throw error;
	} finally {
		await session.endSession();
	}
}

/**
 * Delete all completed todos for a user (with transaction)
 */
export async function deleteCompletedTodos(userId: string) {
	const db = await getDb();
	const session = db.client.startSession();

	try {
		return await session.withTransaction(async () => {
			const collection = await getTodosCollection();

			const deleteResult = await collection.deleteMany({ userId, completed: true }, { session });

			const deletedCount = deleteResult.deletedCount;

			logger.info({ userId, deletedCount }, "Completed todos deleted");

			return deletedCount;
		});
	} catch (error) {
		logger.error({ err: error, userId }, "Failed to delete completed todos");
		throw error;
	} finally {
		await session.endSession();
	}
}
