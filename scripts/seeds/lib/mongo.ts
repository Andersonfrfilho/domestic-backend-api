import { MongoClient } from 'mongodb';

export function createMongoClient(): MongoClient {
  const uri = process.env.MONGO_URI ?? `mongodb://${process.env.DATABASE_MONGO_HOST ?? 'localhost'}:${process.env.DATABASE_MONGO_PORT ?? 27017}/${process.env.DATABASE_MONGO_NAME ?? 'backend_database_mongo'}`;
  return new MongoClient(uri);
}

export function getMongoDbName(): string {
  const uri = process.env.MONGO_URI ?? '';
  const match = uri.match(/\/([^/?]+)(\?|$)/);
  return match?.[1] ?? process.env.DATABASE_MONGO_NAME ?? 'backend_database_mongo';
}
