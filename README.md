# phellow.community Frontend

[![version](https://img.shields.io/badge/version-1.0.0-green.svg)](https://github.com/phellowseven/phellow-community)

Frontend for phellow.community – an open source patient portal respecting KHZG requirements.

![Screenshot of Documents page](/docs/images/02_phellow.community_Dokumente_CPU.jpeg 'Dokumenten Ansicht')

## Getting started

### Requirements

In order for this project to work as expected, you need to have:

- a [SurrealDB](https://surrealdb.com/) Instance running and accessible
- an Identity Provider (IdP) with OAuth2
- a working FHIR Server

### To simply see the application running

#### Install volta to manage node

Follow the volta guide [Getting started](https://docs.volta.sh/guide/getting-started) to install
volta.

#### Install pnpm

After installing volta, install `pnpm`:

```bash
volta install pnpm
```

#### Run

After cloning the repository, change into the project directory and install the dependencies:

```bash
pnpm i
```

Then build the web app:

```bash
pnpm run build
```

Finally launch the sample docker-compose via:

```bash
docker-compose -f docker-compose.sample.yaml up --build --force-recreate
```

You can now visit [http://localhost:8081/login](http://localhost:8081/login) to see the login.
Simply press login and you will be redirected to the dashboard. For this demo app instance, the
login mechanism is handled in the background.

To stop running, press `Ctrl-C`.

### To start building on top

#### Install dependencies

After cloning the repository, install the dependencies:

```bash
pnpm i
```

#### .env file

Then configure your endpoints in a `.env` file (You can use the `.env.mockoon.local` file, if you
want to run a demo environment using the provided [Mockoon](https://mockoon.com/) config. To do so
quickly, symlink the file: `ln -s .env.mockoon .env`).

When using your own endpoints, it's easiest to copy the contents of `.env.example` for all the
configurable variables and customize the values for your system.

#### SurrealDB

In order for sessions to work, you need have a running [SurrealDB](https://surrealdb.com/) instance
the backend can connect to. You can launch one in a [Docker](https://www.docker.com/) container with
the following command (`--user` and `-pass` have to match the `SURREALDB_USER` & `SURREALDB_PASS`
values in your `.env` file):

```bash
docker run --name surrealdb -d -p 8800:8000 surrealdb/surrealdb:latest start --user qlUwnyAXd --pass ig7x0lm9s9Vq4Qy -A
```

Launch the project in development mode and open the url printed by the command in your browser:

```bash
pnpm run dev
```

#### Mockoon

## Architecture

The frontend relies on Server-Side-Rendering (SSR) through SvelteKit. For more details, read
[architecture.md](docs/architecture.md).

### Session security

Read [session.md](docs/session.md).

### i18n

This project uses [Paraglide JS](https://inlang.com/m/gerre34r/library-inlang-paraglideJs). It is
highly recommended to use the VS Code extension
[Sherlock](https://marketplace.visualstudio.com/items?itemName=inlang.vs-code-extension).

## Roadmap

- Structured Data
  - Patients can view structured data in the form of FHIR Observations.
- Anamnesis
  - Patients can submit their anamnesis documents in the form of a FHIR QuestionnaireResponse.
- PROM/PREM
  - Patient Reported Outcome Measures (PROM) & Patient Reported Experience Measures (PREM) can be
    collected.
- Schedule Appointments
  - Patients can schedule an appointment with your institution.

## Deploying

In order to deploy, you need two components:

1. The built SvelteKit application
2. A surrealDB instance

### Building the SvelteKit application

```bash
pnpm run build
```

The outputs are located in the `build` directory. For more details, see
**[Building your app](https://kit.svelte.dev/docs/building-your-app)** in the SvelteKit
documentation.

### Using Docker to deploy the web app

First build the app as shown in the previous section, then you can use the Dockerfile. For an
example on how to deploy multiple services, see `docker-compose.sample.yaml`.

## Sources

Our Sources.

### Sample data

- FHIR Observations provided by
  [Polar Project](https://www.health-atlas.de/data_files/588?version=1) is greatly appreciated

## Debug Server-Side SvelteKit

Add a debugging script to `package.json`:

```json
"scripts": {
  …
  "debug": "NODE_OPTIONS='--inspect' vite dev",
  …
 },
```

Run the command:

```bash
pnpm run debug
```

### Attach your browser as debugging client

Go to [arc://inspect](arc://inspect) and hit _Inspect_ in the process started in the previous step.

Place the `debugger` statement in your server-side code and start debugging right from DevTools.
