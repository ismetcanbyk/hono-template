import type { Collection, ObjectId } from "mongodb";
import { database } from "@/config/database.config";
import type { TodoDocument } from "@/models/todo.model";
import type { CreateTodoInput, UpdateTodoInput } from "@/schemas/todo.schema";

async function getCollection(): Promise<Collection<TodoDocument>> {
	const db = await database.getDb();
	return db.collection<TodoDocument>("todos");
}

export async function createTodo(userId: string, input: CreateTodoInput): Promise<TodoDocument> {
	const collection = await getCollection();

	const todo: TodoDocument = {
		userId,
		title: input.title,
		description: input.description,
		completed: false,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	const result = await collection.insertOne(todo);
	return { ...todo, _id: result.insertedId };
}

export async function findTodosByUserId(userId: string): Promise<TodoDocument[]> {
	const collection = await getCollection();
	return await collection.find({ userId }).sort({ createdAt: -1 }).toArray();
}

export async function findTodoById(id: ObjectId, userId: string): Promise<TodoDocument | null> {
	const collection = await getCollection();
	return await collection.findOne({ _id: id, userId });
}

export async function updateTodo(
	id: ObjectId,
	userId: string,
	input: UpdateTodoInput,
): Promise<TodoDocument | null> {
	const collection = await getCollection();

	const result = await collection.findOneAndUpdate(
		{ _id: id, userId },
		{ $set: { ...input, updatedAt: new Date() } },
		{ returnDocument: "after" },
	);

	return result || null;
}

export async function deleteTodo(id: ObjectId, userId: string): Promise<boolean> {
	const collection = await getCollection();
	const result = await collection.deleteOne({ _id: id, userId });
	return result.deletedCount > 0;
}
