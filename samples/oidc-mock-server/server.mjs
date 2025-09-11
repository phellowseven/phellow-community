import { env } from 'node:process';
import { OAuth2Server } from 'oauth2-mock-server';

let server = new OAuth2Server();
server.issuer.url = env.IDP_BASE_URL || 'http://mock-oidc:8080';

// Generate a new RSA key and add it to the keystore
await server.issuer.keys.generate('RS256');

// server.service.on("beforeAuthorizeRedirect", (_, req) => {
//     console.log(req.url);
//   });

server.service.on("beforeTokenSigning", (token, req) => {
    if (!token.payload.amr) {
        token.payload.email = "johndoe@email.com";
        token.payload.preferred_username = "johndoeUser";
        token.payload.name = "John Doe";
    }

    token.payload.scope = "module_onco";

    // 30s valid access token
    // const timestamp = Math.floor(Date.now() / 1000);
    // token.payload.exp = timestamp + 30;
})

// Start the server
await server.start(8080, "0.0.0.0");
console.log('Issuer URL:', server.issuer.url); // -> http://localhost:8080

// Do some work with the server
// ...

// Stop the server
// await server.stop();