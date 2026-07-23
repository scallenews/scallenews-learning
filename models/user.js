import database from "infra/database.js";

async function create(userImputValues) {
  const results = await database.query({
    text: `
        INSERT INTO 
          users (username, email, password)
        VALUES 
          ($1, $2, $3)
        RETURNING
          *
        ;`,
    values: [
      userImputValues.username,
      userImputValues.email,
      userImputValues.password,
    ],
  });
  return results.rows[0];
}

const user = {
  create,
};

export default user;
