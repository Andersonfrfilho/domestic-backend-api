// Entry point exclusivo para o CLI do TypeORM (migration:run, migration:generate, etc.)
// NÃO use este arquivo na aplicação NestJS — use postgres.database-connection.ts
export { default } from './postgres.database-connection';
