# phellow•community

**Your open source patient portal using FHIR.**

[![version](https://img.shields.io/badge/version-2.2.2-green.svg)](https://github.com/phellowseven/phellow-community)

Welcome to **phellow•community**, an open-source patient portal designed to streamline creating a
frontend for your healthcare project needs. This project aims to provide a user-friendly interface
for managing appointments and accessing medical records using HL7 FHIR.

![phellow•community Documents view](/docs/images/02_phellow.community_Dokumente_CPU.png)

## Table of Contents

- [phellow•community](#phellowcommunity)
  - [Table of Contents](#table-of-contents)
  - [About the Project](#about-the-project)
  - [Features](#features)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Launch a demo](#launch-a-demo)
  - [Usage](#usage)
  - [Contributing](#contributing)
  - [Documentation](#documentation)
  - [License](#license)

---

## About the Project

The Patient Portal is a modern, open-source solution for healthcare providers and patients. It is
built with a focus on accessibility, security, and ease of use. The project leverages cutting-edge
web technologies like **Svelte**, **SvelteKit**, **TailwindCSS**, and **Vite** to deliver a seamless
experience.

---

## Features

- **Appointment Management**: See scheduled appointments.
- **Medical Records Access**: View and download medical records securely.
- **Laboratory Values**: Display patients lab values and graph them.
- **Multi-Language Support**: Built-in support for multiple languages.
- **Responsive Design**: Fully optimized for desktop and mobile devices.

---

## Getting Started

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [pnpm](https://pnpm.io/) (preferred package manager)
- Docker (optional, for containerized deployment)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/phellowseven/phellow-community.git
   cd phellow-community
   ```
2. Install dependencies
   ```bash
   pnpm install
   ```
3. Set up environment variables:
   - Copy `.env.development.example` to `.env.development`. It works as-is with the mock services
     described below; adjust it only when pointing at a real FHIR server or identity provider (see
     `.env.schema` for every variable).
4. Start the development server:
   ```bash
   pnpm run dev
   ```

### Launch a demo

If you don't have an OAuth Provider or data repository available, you can use the mock services
provided.

To launch a mock OIDC Provider, run:

```bash
pnpm run mock:oidc
```

To provide sample FHIR data to the application, you can launch [Mockoon](https://mockoon.com/) with
the config at `samples/mockoon.json`.

`.env.development.example` already points at these mock services on `localhost`, so it works as-is
for this local setup.

The database needs to be initialised with a schema, so run the push command:

```bash
pnpm run db:push
```

Then start the development server:

```bash
pnpm run dev
```

If you have Docker available on your system, you can launch the whole demo stack (app, mock OIDC
provider, Mockoon and Postgres) with the development compose file:

```bash
cp .env.development.example .env.development
docker compose -f docker-compose.development.yml up
```

See [DOCKER.md](DOCKER.md) for the other compose setups and troubleshooting.

## Usage

- Access the application in your browser at `http://localhost:5173` (default Vite port).
- Patients can log in to view their data

For detailed usage instructions, refer to the [docs](/docs/) directory.

## Contributing

We welcome contributions from the community! To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes and push the branch:
   ```bash
   git commit -m "Add your feature description"
    git push origin feature/your-feature-name
   ```
4. Open a pull request.

Thank you for contributing to phellow•community! Together, we can make healthcare more accessible
and efficient.

## Documentation

For more detailed documentation, including API references, deployment guides, and architecture
overviews, visit the [docs](/docs/) directory.

## License

This project is licensed under the Apache License Version 2.0 License. Feel free to use, modify, and
distribute it as per the terms of the license.
