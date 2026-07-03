import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
}, 90000);

describe("POST /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Two concurrent requests should not conflict", async () => {
      const [response1, response2] = await Promise.all([
        fetch("http://localhost:3000/api/v1/migrations", { method: "POST" }),
        fetch("http://localhost:3000/api/v1/migrations", { method: "POST" }),
      ]);

      const statuses = [response1.status, response2.status].sort();
      // Uma delas roda as migrations (201) e a outra encontra tudo já
      // aplicado (200) — nenhuma pode falhar com 500.
      expect(statuses).toEqual([200, 201]);
    });
  });
});
