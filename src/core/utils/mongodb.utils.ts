import type { Collection, Db, Document } from "mongodb";

export const collections = {
	TODOS: "todos",
	USERS: "users",
} as const;

/**
 * Type-safe collection getter
 * Ensures MongoDB collections are strongly typed
 *
 * @param db - MongoDB database instance
 * @param collectionName - Name of the collection
 * @returns Type-safe collection instance
 */
export function getCollection<T extends Document>({
	db,
	collectionName,
}: {
	db: Db;
	collectionName: (typeof collections)[keyof typeof collections];
}): Collection<T> {
	return db.collection<T>(collectionName);
}
