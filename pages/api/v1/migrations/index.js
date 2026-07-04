import { runner as migrationRunner } from "node-pg-migrate";
import { resolve } from "node:path";
import fs from "node:fs"; // Módulo nativo do Node
import database from "infra/database";

export default async function migrations(request, response) {
  const allowedMethods = ["GET", "POST"];
  if (!allowedMethods.includes(request.method)) {
    return response.status(405).json({
      error: `Method "${request.method}" not allowed.`,
    });
  }

  // TRUQUE DO CURSO.DEV: Força a Vercel a incluir a pasta de migrations no bundle
  const migrationsFolder = resolve(process.cwd(), "infra", "migrations");
  fs.readdirSync(migrationsFolder);

  let dbClient;
  try {
    dbClient = await database.getNewClient();

    const defaultMigrationOptions = {
      dbClient: dbClient,
      dryRun: true,
      dir: migrationsFolder,
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    };

    if (request.method === "GET") {
      const pendingMigrations = await migrationRunner(defaultMigrationOptions);
      return response.status(200).json(pendingMigrations);
    }

    if (request.method === "POST") {
      const migratedMigrations = await migrationRunner({
        ...defaultMigrationOptions,
        dryRun: false,
      });

      if (migratedMigrations.length > 0) {
        return response.status(201).json(migratedMigrations);
      }

      return response.status(200).json(migratedMigrations);
    }
  } catch (error) {
    console.error("Erro no ciclo de execução das migrations:", error);
    return response.status(500).json({
      error: "Internal Server Error",
      message: "Falha ao processar as migrações do banco de dados.",
    });
  } finally {
    if (dbClient) {
      await dbClient.end();
    }
  }
}
