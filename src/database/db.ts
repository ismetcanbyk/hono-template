import { MongoClient, Db } from 'mongodb';
import { env } from '../env.js';

class Database {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private static instance: Database;

  private constructor() { }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<Db> {
    if (this.db) {
      return this.db;
    }

    try {
      this.client = new MongoClient(env.DATABASE_URL, {
        maxPoolSize: 10,
        minPoolSize: 5,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });

      await this.client.connect();
      this.db = this.client.db();

      console.log('✅ MongoDB bağlantısı başarılı');
      return this.db;
    } catch (error) {
      console.error('❌ MongoDB bağlantı hatası:', error);
      throw error;
    }
  }

  public getDb(): Db {
    if (!this.db) {
      throw new Error('Veritabanı bağlantısı henüz kurulmadı. Önce connect() metodunu çağırın.');
    }
    return this.db;
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log('MongoDB bağlantısı kapatıldı');
    }
  }

  public async ping(): Promise<boolean> {
    try {
      if (!this.db) {
        return false;
      }
      await this.db.admin().ping();
      return true;
    } catch (error) {
      console.error('MongoDB ping hatası:', error);
      return false;
    }
  }
}

export const database = Database.getInstance();
export const getDb = () => database.getDb();
