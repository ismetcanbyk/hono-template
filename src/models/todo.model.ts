import type { ObjectId } from "mongodb";

export interface TodoDocument {
	_id?: ObjectId;
	userId: string;
	title: string;
	description?: string;
	completed: boolean;
	createdAt: Date;
	updatedAt: Date;
}
