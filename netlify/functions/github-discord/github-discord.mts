
import type { Handler, HandlerEvent } from "@netlify/functions";
import * as crypto from "crypto";

const notifyToDiscordChannel = async(message: string) => {
  // Consultar la documentacion oficial para ver cómo usar webhooks de discord. En la documentacion se menciona que hay que hacer una peticion POST al webhook o url asociado a un canal de un servidor que incluya lo que queremos enviarle a dicho canal (content)
  const body = {
    content: message,
  }

  // Peticion POST a this.discordWebHookUrl
  const resp = await fetch( process.env.DISCORD_WEBHOOK_URL ?? '', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},// Si body es un json (application/json), body es de tipo raw
    body: JSON.stringify(body),// en peticion POST que usualmente es cross domain, se pide que el body vaya como un string
  });

  
  if ( !resp.ok ) {
    console.log('Error sending message to discord');
    return false
  }

  return true;

}

// Ejecutar este metodo cuando el evento que venga en el header de la peticion post a /api/github realizada por webhook de repositorio "github-webhook" sea un evento de haber dado una estrella a dicho repositorio
const onStar = ( payload: any ): string => {
  
  const { action, sender, repository } = payload;// starred_at coontiene la fecha de cuando ocurrió el suceso de haberle dado una estrella a dicho repositorio

  // console.log(starred_at);


  return `User ${sender.login} ${action} star on ${repository.full_name}`;

}

const onIssue = ( payload: any ): string => {

    const { action, issue } = payload;
    
    // console.log({action});

    if ( action === 'opened' ) {
      return `An issue was ${ action } with the following title: ${issue.title}`;
    }

    if ( action === 'closed' ) {
      return `An issue was ${ action } by ${ issue.user.login }`;
    }

    if ( action === 'reopened' ) {
      return `An issue was ${ action } by ${ issue.user.login }`;
    }

    return `Unhandled action for the issue event ${action}`;


  }


const verify_signature = (event: HandlerEvent) => {
  const WEBHOOK_SECRET: string = process.env.SECRET_TOKEN_WEBHOOK_REPO ?? '';
  console.log({WEBHOOK_SECRET});
  try {
    const signature = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(event.body as string)
      .digest("hex");
    
    const xHubSignature = event.headers["x-hub-signature-256"] ?? '';

    let trusted = Buffer.from(`sha256=${signature}`, 'ascii');
    let untrusted =  Buffer.from(xHubSignature, 'ascii');
    return crypto.timingSafeEqual(trusted, untrusted);
  } catch(error) {
    return false;
  }
};

export const handler: Handler = async (event: HandlerEvent, context) => {

  if ( !verify_signature( event ) ) {
    return {
      statusCode: 401,
      body: 'Unauthorized',
      headers: {
        'Content-Type':'text/plain'
      }
    }
  }

  const githubEvent = event.headers['x-github-event'] ?? 'unknown';
  const payload = JSON.parse( event.body ?? '{}' );// event.body viene como un json en forma de string
  let message:string;


  console.log(payload);

  //console.log(JSON.stringify(payload));// usado para copiar lo retornado por JSON.stringify(payload) y pegarlo en https://app.quicktype.io/ para producir un conjunto de interfaces con tipado estricto para typescript.
 ; 
  switch (githubEvent) {
    case 'star':
      message = onStar(payload);
    break;
    case 'issues':
      message = onIssue(payload);
    break;
    
    default:
      message = `Unknown event ${ githubEvent }`;
  }



  await notifyToDiscordChannel(message);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'success!' }),
    headers: {
      'Content-Type':'application/json'
    }
  }
}

