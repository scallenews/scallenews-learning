import { Client } from "pg";

async function query(queryObject) {
  let client;
  try {
    client = await getNewClient();
    const result = await client.query(queryObject);
    return result;
  } catch (error) {
    console.error("Erro na execução da query:", error);
    throw error;
  } finally {
    // Evita erro de 'cannot read property end of undefined' se falhar antes de instanciar
    if (client) {
      await client.end();
    }
  }
}

async function getNewClient() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: getSSLValues(),
  });

  try {
    await client.connect();
    return client;
  } catch (error) {
    console.error("Erro ao conectar no banco de dados:", error);
    // Garante que o cliente seja fechado apropriadamente se falhar no handshake
    if (client) {
      await client.end().catch(() => {});
    }
    throw error;
  }
}

const database = {
  query,
  getNewClient,
};
export default database;

function getSSLValues() {
  if (process.env.POSTGRES_CA) {
    return {
      ca: process.env.POSTGRES_CA,
    };
  }

  // Se for produção e o provedor exigir SSL mas usar certificado autoassinado,
  // altere para false para aceitar conexões criptografadas sem checagem estrita de CA,
  // ou mantenha se sua PaaS fornecer a variável POSTGRES_CA preenchida.
  if (process.env.NODE_ENV === "production") {
<<<<<<< HEAD
    // Permite conexão SSL na Vercel contornando a rejeição de certificados autoassinados das PaaS
    return {
      rejectUnauthorized: false,
    };
=======
    return true;
>>>>>>> origin/main
  }

  return false;
}

// import { Client } from "pg";

// async function query(queryObject) {
//   let client;
//   try {
//     client = await getNewClient();
//     const result = await client.query(queryObject);
//     return result;
//   } catch (error) {
//     console.error(error);
//     throw error;
//   } finally {
//     await client.end();
//   }
// }

// async function getNewClient() {
//   const client = new Client({
//     host: process.env.POSTGRES_HOST,
//     port: process.env.POSTGRES_PORT,
//     user: process.env.POSTGRES_USER,
//     database: process.env.POSTGRES_DB,
//     password: process.env.POSTGRES_PASSWORD,
//     ssl: getSSLValues(),
//   });

//   await client.connect();
//   return client;
// }

// const database = {
//   query,
//   getNewClient,
// };
// export default database;

// function getSSLValues() {
//   if (process.env.POSTGRES_CA) {
//     return {
//       ca: process.env.POSTGRES_CA,
//     };
//   }

//   if (process.env.NODE_ENV === "production") {
//     return {
//       rejectUnauthorized: true,
//     };
//   }

//   return false;
// }
