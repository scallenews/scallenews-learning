import { runner as migrationRunner } from "node-pg-migrate";
import { resolve } from "node:path";
import { readdirSync } from "node:fs";
import database from "infra/database";

readdirSync(resolve("infra", "migrations"));

const ALLOWED_METHODS = ["GET", "POST"];
const MIGRATIONS_LOCK_ID = 918273645;

const defaultMigrationOptions = {
  dir: resolve("infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: "pgmigrations",
};

export default async function migrations(request, response) {
  if (!ALLOWED_METHODS.includes(request.method)) {
    response.setHeader("Allow", ALLOWED_METHODS.join(", "));
    return response.status(405).json({
      error: `Method "${request.method}" not allowed`,
    });
  }

  if (request.method === "GET") return handleGet(response);
  if (request.method === "POST") return handlePost(response);
}

async function handleGet(response) {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
      dryRun: true,
    });
    return response.status(200).json(pendingMigrations);
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Internal server error" });
  } finally {
    if (dbClient) {
      await dbClient.end().catch((endError) => {
        console.error("Erro ao encerrar conexão:", endError);
      });
    }
  }
}

async function handlePost(response) {
  let lockClient;
  let migrationClient;

  try {
    lockClient = await database.getNewClient();
    await lockClient.query("SELECT pg_advisory_lock($1);", [
      MIGRATIONS_LOCK_ID,
    ]);

    migrationClient = await database.getNewClient();
    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient: migrationClient,
      dryRun: false,
    });

    const statusCode = migratedMigrations.length > 0 ? 201 : 200;
    return response.status(statusCode).json(migratedMigrations);
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Internal server error" });
  } finally {
    if (migrationClient) {
      await migrationClient.end().catch((endError) => {
        console.error("Erro ao encerrar migrationClient:", endError);
      });
    }
    if (lockClient) {
      // Só libera o lock depois que migrationClient já terminou acima.
      await lockClient
        .query("SELECT pg_advisory_unlock($1);", [MIGRATIONS_LOCK_ID])
        .catch((unlockError) => {
          console.error("Erro ao liberar lock:", unlockError);
        });
      await lockClient.end().catch((endError) => {
        console.error("Erro ao encerrar lockClient:", endError);
      });
    }
  }
}
