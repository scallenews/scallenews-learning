import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
}, 90000);

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      const [response] = await Promise.all([
        fetch("http://localhost:3000/api/v1/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "ronaldojacinto",
            email: "contato@scalle.app.br",
            password: "Senha@123",
          }),
        }),
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

      const resposeBody = await response.json();

      expect(resposeBody).toEqual({
        id: resposeBody.id,
        username: "ronaldojacinto",
        email: "contato@scalle.app.br",
        password: "Senha@123",
        created_at: resposeBody.created_at,
        updated_at: resposeBody.updated_at,
      });

      expect(uuidVersion(resposeBody.id)).toBe(4);
      expect(Date.parse(resposeBody.created_at)).not.toBeNaN();
      expect(Date.parse(resposeBody.updated_at)).not.toBeNaN();
    });
  });
});
