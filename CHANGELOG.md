# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Toolchain: Node 22.23.2, pnpm 10.34.5 (volta, packageManager, CI, Dockerfile); CI actions bumped
  to `pnpm/action-setup@v4` and `actions/cache@v4`.
- Dependencies updated to latest compatible versions, notably Vite 6 → 8 (Rolldown), Vitest 3 → 5,
  Storybook 9 → 10, SvelteKit 2.70, Svelte 5.57, Tailwind CSS 4.3, bits-ui 2.19, Paraglide 2.25, Zod
  3 → 4 (superforms `zod4` adapters), @lucide/svelte 1.x (renamed icon aliases), @pdfslick/core 4
  (pdf.js 6), pino 10, uuid 14, tailwind-variants 3, lint-staged 17, oauth2-mock-server 9, prettier
  3.9 with prettier-plugin-svelte 4 and prettier-plugin-tailwindcss 0.8.
- `parseFHIRBundle` narrows bundle entries to `FhirResource` (required by @types/fhir 0.0.44).

### Removed

- Unused `@storybook/addon-vitest` (was never wired up), orphaned `eslint-plugin-storybook` and
  legacy `.eslintrc.cjs` / `.eslintignore`, unused `tsx`.

### Notes

- TypeScript stays on 5.9.x: svelte-check requires TypeScript 6 alongside TypeScript 7 plus an
  experimental flag, so TS 7 was tried and reverted.
- `@oslojs/crypto` and `@oslojs/jwt` are deprecated upstream with no successor version; still in
  use.

## [1.0.1] – 2024-11-13

### Added

- Proper README with helpful instructions.
- docker-compose file to quickly get a running instance for simply playing around.
- View for structured data (FHIR Observations) with filtering, sorting, and graphing
  - Graphs are created by gathering data with the same coding
- Questionnaire Renderer
  - Can parse FHIR Questionnaires into stepped questions
  - Supports some enableWhen fields

### Changed

- Made the call to the OAuth 2.0 Discovery endpoint asynchronous.
- Made the connection to the DB asynchronous.

### Fixed

- Proper Base64 url encoding that does not produce slashes.

## [1.0.0] – 2024-09-10

### Added

- the initial project.
