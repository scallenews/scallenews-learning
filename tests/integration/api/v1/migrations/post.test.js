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

      const [body1, body2] = await Promise.all([
        response1
          .clone()
          .json()
          .catch(() => null),
        response2
          .clone()
          .json()
          .catch(() => null),
      ]);

      const statuses = [response1.status, response2.status].sort();

      // Se falhar, isso aparece no log do Jest (visível até no CI)
      // com o erro real devolvido pela API.
      if (statuses[0] !== 200 || statuses[1] !== 201) {
        console.log("DEBUG body1:", body1);
        console.log("DEBUG body2:", body2);
      }

      expect(statuses).toEqual([200, 201]);
    });
  });
});
