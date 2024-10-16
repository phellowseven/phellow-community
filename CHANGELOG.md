# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Proper README with helpful instructions.
- docker-compose file to quickly get a running instance for simply playing around.

### Changed

- Made the call to the OAuth 2.0 Discovery endpoint asynchronous.
- Made the connection to the DB asynchronous.

### Fixed

- Proper Base64 url encoding that does not produce slashes.

## [1.0.0] – 2024-09-10

### Added

- the initial project.
