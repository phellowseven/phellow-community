# Session Management

User sessions are managed using cookies. Two cookies are relevant for this:

1. `auth_session`: The id for this session so the server can retrieve this specific session.
2. `env_key`: The symmetric encryption key as JWK. This is passed to the server in order to
   en-/decrypt the access and refresh tokens in the DB.

## Encrypted Access & Refresh Token

The access and refresh tokens are stored encrypted in the DB. These tokens are encrypted per session
with a key that is created during login, only persisted client-side and passed to the server with
each request via the `env_key` cookie. In the `hooks.server.ts` method `authHandle`, the stored
tokens are decrypted on-demand and used to verify the access.

Should the access token be expired, the refresh token is used to refresh the authentication with the
Identity Provider (IdP).

If the access token was refreshed, the newly acquired refresh and access tokens are again encrypted
using the `env_key`. The current session in the DB is invalidated and a new one is created with
these encrypted tokens.

## Reasoning

Storing the symmetric encryption key client-side ensures that the application doesn't hold any key
to decrypt the tokens. The cookie is `HttpOnly`, so no JavaScript can access it on the client.

> A cookie with the Secure attribute is only sent to the server with an encrypted request over the
> HTTPS protocol. It's never sent with unsecured HTTP (except on localhost), which means
> man-in-the-middle attackers can't access it easily. Insecure sites (with http: in the URL) can't
> set cookies with the Secure attribute.

[Source](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#block_access_to_your_cookies)

> A cookie with the HttpOnly attribute can't be modified by JavaScript, for example using
> Document.cookie; it can only be modified when it reaches the server. […] This precaution helps
> mitigate cross-site scripting (XSS) attacks.

[Source](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#block_access_to_your_cookies)
