import email from "infra/email.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.js", () => {
  test("send", async () => {
    await orchestrator.deleteAllEmails();

    await email.send({
      from: "ScalleApp <contato@scalle.app.br>",
      to: "contato@scallemusic.com.br",
      subject: "Teste de assunto",
      text: "Teste de corpo.",
    });

    await email.send({
      from: "ScalleApp <contato@scalle.app.br>",
      to: "contato@scallemusic.com.br",
      subject: "Ultimo email enviado",
      text: "Corpo do ultimo email.",
    });

    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<contato@scalle.app.br>");
    expect(lastEmail.recipients[0]).toBe("<contato@scallemusic.com.br>");
    expect(lastEmail.subject).toBe("Ultimo email enviado");
    expect(lastEmail.text).toBe("Corpo do ultimo email.\n");
  });
});
