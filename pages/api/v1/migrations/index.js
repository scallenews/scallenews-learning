import { runner as migrationRunner } from "node-pg-migrate";
import { resolve } from "node:path";
import { readdirSync } from "node:fs";
import database from "infra/database";

readdirSync(resolve("infra", "migrations"));

const ALLOWED_METHODS = ["GET", "POST"];
import fs from "node:fs";
import database from "infra/database";

const MIGRATIONS_LOCK_ID = 918273645;

export default async function migrations(request, response) {
  const allowedMethods = ["GET", "POST"];
  if (!allowedMethods.includes(request.method)) {
    return response.status(405).json({
      error: `Method "${request.method}" not allowed.`,
    });
  }

  const migrationsFolder = resolve(process.cwd(), "infra", "migrations");
  fs.readdirSync(migrationsFolder);

  if (request.method === "GET") {
    let dbClient;
    try {
      dbClient = await database.getNewClient();
      const pendingMigrations = await migrationRunner({
        dbClient,
        dryRun: true,
        dir: migrationsFolder,
        direction: "up",
        verbose: true,
        migrationsTable: "pgmigrations",
      });
      return response.status(200).json(pendingMigrations);
    } catch (error) {
      console.error("Erro ao listar migrations:", error);
      return response.status(500).json({
        error: "Internal Server Error",
        message: "Falha ao processar as migrações do banco de dados.",
      });
    } finally {
      if (dbClient) await dbClient.end();
    }
  }

async function handlePost(response) {
  let lockClient;
  let migrationClient;
  if (request.method === "POST") {
    let lockClient;
    let migrationClient;
    try {
      lockClient = await database.getNewClient();
      await lockClient.query("SELECT pg_advisory_lock($1);", [
        MIGRATIONS_LOCK_ID,
      ]);

      migrationClient = await database.getNewClient();
      const migratedMigrations = await migrationRunner({
        dbClient: migrationClient,
        dryRun: false,
        dir: migrationsFolder,
        direction: "up",
        verbose: true,
        migrationsTable: "pgmigrations",
      });

      const statusCode = migratedMigrations.length > 0 ? 201 : 200;
      return response.status(statusCode).json(migratedMigrations);
    } catch (error) {
      console.error("Erro no ciclo de execução das migrations:", error);
      return response.status(500).json({
        error: "Internal Server Error",
        message: "Falha ao processar as migrações do banco de dados.",
      });
    } finally {
      if (migrationClient) await migrationClient.end();
      if (lockClient) {
        await lockClient
          .query("SELECT pg_advisory_unlock($1);", [MIGRATIONS_LOCK_ID])
          .catch((e) => console.error("Erro ao liberar lock:", e));
        await lockClient.end();
      }
    }
  }
}
