
import type { Handler } from "@netlify/functions"

export const handler: Handler = async (event, context) => {

  const myImportantVariable = process.env.MY_IMPORTANT_VARIABLE;

  if ( !myImportantVariable ) {
    throw 'Missing MY_IMPORTANT_VARIABLE';
  }

  console.log('Hola mundo desde funcion variables.mts handler');

  return {
    statusCode: 200,
    body: JSON.stringify({ myImportantVariable }),
    headers: {
      'Content-Type':'application/json'
    }
  }
}




