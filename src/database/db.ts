import { type Db, MongoClient } from "mongodb";
import { env } from "../env.js";


let client: MongoClient | null = null;
let db: Db | null = null;


export async function connect(): Promise<Db> {
	if (db) {
		return db;
	}

	try {
		client = new MongoClient(env.DATABASE_URL, {
			maxPoolSize: 10,
			minPoolSize: 5,
			connectTimeoutMS: 10000,
			socketTimeoutMS: 45000,
		});

		await client.connect();
		db = client.db();

		console.log("✅ MongoDB bağlantısı başarılı");
		return db;
	} catch (error) {
		console.error("❌ MongoDB bağlantı hatası:", error);
		throw error;
	}
}


export async function getDb(): Promise<Db> {
	if (!db) {
		await connect();
	}
	return db as Db;
}


export async function disconnect(): Promise<void> {
	if (client) {
		await client.close();
		client = null;
		db = null;
		console.log("MongoDB bağlantısı kapatıldı");
	}
}


export async function ping(): Promise<boolean> {
	try {
		if (!db) {
			return false;
		}
		await db.admin().ping();
		return true;
	} catch (error) {
		console.error("MongoDB ping hatası:", error);
		return false;
	}
}
