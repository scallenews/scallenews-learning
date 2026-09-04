import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import authentication from "models/authentication.js";
import session from "models/session";

const router = createRouter();

router.post(postHandler);
router.delete(deleteHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInputValues = request.body;

  if (!userInputValues?.email || !userInputValues?.password) {
    return response.status(401).json({
      name: "UnauthorizedError",
      message: "Dados de autenticação não conferem.",
      action: "Verifique se os dados enviados estão corretos.",
      status_code: 401,
    });
  }

  const authenticatedUser = await authentication.getAuthenticatedUser(
    userInputValues.email,
    userInputValues.password,
  );

  const newSession = await session.create(authenticatedUser.id);

  controller.setSessionCookie(newSession.token, response);

  return response.status(201).json(newSession);
}

async function deleteHandler(request, response) {
  const sessionToken = request.cookies.session_id;

  const sessionObject = await session.findOneValidByToken(sessionToken);
  const expiredSession = await session.expireById(sessionObject.id);
  controller.clearSessionCookie(response);

  return response.status(200).json(expiredSession);
}
