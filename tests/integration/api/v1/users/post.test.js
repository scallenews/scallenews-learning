import orchestrator from "tests/orchestrator.js";
import database from "infra/database";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
}, 90000);

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      await database.query({
        text: "INSERT INTO users (username, email, password) VALUES ($1, $2, $3);",
        values: ["ronaldojacinto", "contato@scalle.app.br", "Senha@123"],
      });

      const users = await database.query("SELECT * FROM users;");
      console.log(users.rows);

      const [response] = await Promise.all([
        fetch("http://localhost:3000/api/v1/users", { method: "POST" }),
      ]);

      const [body] = await Promise.all([
        response
          .clone()
          .json()
          .catch(() => null),
      ]);

      const statuses = [response.status].sort();

      if (statuses[0] !== 201) {
        console.log("DEBUG body:", body);
      }

      expect(statuses).toEqual([201]);
    });
  });
});
