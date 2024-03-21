import type { Handler } from "@netlify/functions"

export const handler: Handler = async (event, context) => {

  console.log('Hola mundo desde funcion hello.mts handler');

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello World" }),
    headers: {
      'Content-Type':'application/json'
    }
  }
}

