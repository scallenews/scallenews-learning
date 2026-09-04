import crypto from "node:crypto";
import { promisify } from "node:util";
import database from "infra/database.js";
import { UnauthorizedError } from "infra/errors.js";

const randomBytesAsync = promisify(crypto.randomBytes);

const ONE_SECOND_IN_MS = 1000;
const ONE_MINUTE_IN_MS = 60 * ONE_SECOND_IN_MS;
const ONE_HOUR_IN_MS = 60 * ONE_MINUTE_IN_MS;
const ONE_DAY_IN_MS = 24 * ONE_HOUR_IN_MS;
const EXPIRATION_IN_MILLISECONDS = 30 * ONE_DAY_IN_MS; // 30 Days

async function findOneValidByToken(sessionToken) {
  const sessionFound = await runSelectQuery(sessionToken);

  return sessionFound;

  async function runSelectQuery(sessionToken) {
    const results = await database.query({
      text: `
        SELECT
          id, token, user_id, expires_at, created_at, updated_at
        FROM
          sessions
        WHERE
          token = $1
          AND expires_at > NOW()
        LIMIT
          1
      ;`,
      values: [sessionToken],
    });

    if (results.rowCount === 0) {
      throw new UnauthorizedError({
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se este usuário está logado e tente novamente.",
      });
    }

    return results.rows[0];
  }
}

async function create(userId) {
  const token = await generateToken();
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const newSession = await runInsertQuery(token, userId, expiresAt);
  return newSession;

  async function generateToken() {
    const buffer = await randomBytesAsync(48);
    return buffer.toString("hex");
  }

  async function runInsertQuery(token, userId, expiresAt) {
    const results = await database.query({
      text: `
        INSERT INTO
          sessions (token, user_id, expires_at)
        VALUES
          ($1, $2, $3)
        RETURNING
          id, token, user_id, expires_at, created_at, updated_at
      ;`,
      values: [token, userId, expiresAt],
    });

    return results.rows[0];
  }
}

async function renew(sessionId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const renewedSessionObject = await runUpdateQuery(sessionId, expiresAt);
  return renewedSessionObject;

  async function runUpdateQuery(sessionId, expiresAt) {
    const results = await database.query({
      text: `
        UPDATE
          sessions
        SET
          expires_at = $2,
          updated_at = NOW()
        WHERE
          id = $1
        RETURNING
          id, token, user_id, expires_at, created_at, updated_at
        ;`,
      values: [sessionId, expiresAt],
    });

    if (results.rowCount === 0) {
      throw new UnauthorizedError({
        message: "Sessão não encontrada.",
        action: "Verifique se o ID da sessão está correto.",
      });
    }

    return results.rows[0];
  }
}

async function expireById(sessionId) {
  const expiredSessionObject = await runUpdateQuery(sessionId);
  return expiredSessionObject;

  async function runUpdateQuery(sessionId) {
    const results = await database.query({
      text: `
        UPDATE
          sessions
        SET
          expires_at = NOW() - interval '1 second',
          updated_at = NOW()
        WHERE
          id = $1
        RETURNING
          id, token, user_id, expires_at, created_at, updated_at
        ;`,
      values: [sessionId],
    });

    if (results.rowCount === 0) {
      throw new UnauthorizedError({
        message: "Sessão não encontrada.",
        action: "Verifique se o ID da sessão está correto.",
      });
    }

    return results.rows[0];
  }
}

const session = {
  create,
  findOneValidByToken,
  renew,
  expireById,
  EXPIRATION_IN_MILLISECONDS,
};

export default session;
