import { type Db, MongoClient } from "mongodb";

import { env } from "@/config/environment.config";
import { logger } from "@/config/logger.config";

/**
 * Database connection manager
 * Implements singleton pattern for MongoDB connection
 */
class DatabaseManager {
	private client: MongoClient | null = null;
	private db: Db | null = null;
	private readonly connectionOptions = {
		maxPoolSize: 10,
		minPoolSize: 5,
		connectTimeoutMS: 10000,
		socketTimeoutMS: 45000,
	};

	/**
	 * Establishes connection to MongoDB
	 * @returns Promise<Db> - MongoDB database instance
	 */
	async connect(): Promise<Db> {
		if (this.db) {
			return this.db;
		}

		try {
			this.client = new MongoClient(env.DATABASE_URL, this.connectionOptions);
			await this.client.connect();
			this.db = this.client.db();

			logger.info("✅ Database connected successfully");
			return this.db;
		} catch (error) {
			logger.error({ err: error }, "❌ Database connection failed");
			throw error;
		}
	}

	/**
	 * Gets the database instance (connects if not already connected)
	 * @returns Promise<Db> - MongoDB database instance
	 */
	async getDb(): Promise<Db> {
		if (!this.db) {
			await this.connect();
		}
		return this.db as Db;
	}

	/**
	 * Closes the database connection
	 */
	async disconnect(): Promise<void> {
		if (this.client) {
			await this.client.close();
			this.client = null;
			this.db = null;
			logger.info("✅ Database disconnected successfully");
		}
	}

	/**
	 * Checks if database is reachable
	 * @returns Promise<boolean> - true if database is healthy
	 */
	async ping(): Promise<boolean> {
		try {
			if (!this.db) {
				return false;
			}
			await this.db.admin().ping();
			return true;
		} catch (error) {
			logger.error({ err: error }, "❌ Database ping failed");
			return false;
		}
	}

	/**
	 * Checks if database is connected
	 */
	isConnected(): boolean {
		return this.db !== null;
	}

	/**
	 * Gets the current database instance (without connecting)
	 */
	getDbOrNull(): Db | null {
		return this.db;
	}
}

// Export singleton instance
export const database = new DatabaseManager();
