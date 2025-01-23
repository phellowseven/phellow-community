# phellow•community

[![version](https://img.shields.io/badge/version-2.0.0-green.svg)](https://github.com/phellowseven/phellow-community)

Your open source patient portal respecting KHZG requirements.

## Favicon

[https://realfavicongenerator.net/](https://realfavicongenerator.net/)

## Developing

Once you've created a project and installed dependencies with `pnpm install`, launch the oidc mock
server to mock the authentication during development:

```bash
pnpm run mock:oidc
```

Then start a development server:

```bash
pnpm run dev

# or start the server and open the app in a new browser tab
pnpm run dev -- --open
```

## Building

To create a production version of your app:

```bash
pnpm run build
```

You can preview the production build with `pnpm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for
> your target environment.
