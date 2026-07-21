import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database";

const MIGRATIONS_LOCK_ID = 918273645;

async function listPendingMigrations() {
  const migrationsFolder = resolve(process.cwd(), "infra", "migrations");
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

    return pendingMigrations;
  } finally {
    if (dbClient) await dbClient.end();
  }
}

async function runPendingMigrations() {
  const migrationsFolder = resolve(process.cwd(), "infra", "migrations");
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

    return migratedMigrations;
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

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
