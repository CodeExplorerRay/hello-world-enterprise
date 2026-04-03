# Changelog

All notable changes to this deeply over-governed greeting platform are documented in this file.

## [2.1.0] - 2026-04-03

### Added
- Replaced the mock greeting endpoint with a real gateway orchestration flow across feature flags, A/B testing, AI, teapot health, capitalization, concatenation, and punctuation services.
- Added a browser form so users can submit recipient, channel, locale, and greeting strategy to the API gateway.
- Added a live cost-per-greeting widget to the frontend.
- Added an April 1st easter egg that replaces the normal greeting with `APRIL FOOLS`.
- Added a richer OpenAPI specification describing the full metadata payload.
- Added a richer Grafana dashboard definition for latency, AI confidence, teapot 418 counts, cost per greeting, and experiment distribution.

### Changed
- Updated the AI decision engine to `gemini-flash-lite-latest`.
- Improved Gemini response parsing to handle fenced JSON and extra model prose.
- Wired local Docker Compose to pass `GEMINI_API_KEY` from the repo-root `.env`.
- Reworked the greeting audit workflow to test the real stack instead of a mocked fallback.

### Fixed
- Fixed frontend proxying inside Docker so requests no longer target `localhost` from within the container.
- Fixed the capitalization service Docker build by aligning Maven's Java target with Java 25 LTS.
- Fixed runtime port drift across Compose, Dockerfiles, and service listeners.

## [2.0.1] - 2026-04-02

### Fixed
- Rolled back an unauthorized punctuation governance experiment after "Hello World." tested poorly with stakeholders.
- Corrected teapot health behavior following reports that the service briefly behaved like a coffee machine.

## [2.0.0] - 2026-04-02

### Changed
- Introduced enterprise-grade service decomposition for greeting generation.
- Added AI decision support for greeting word selection.
- Added formal feature-flag and experimentation services for greeting policy control.

## [1.1.0] - 2026-04-01

### Changed
- Changed greeting from `Hello` to `Hi`.

### Fixed
- Rolled back the change after a P0 incident and an embarrassing incident report.

## [1.0.0] - 2026-03-31

### Added
- Initial release of HelloWorld Enterprise Edition.
- Guaranteed that one greeting could be generated with a wholly unreasonable amount of infrastructure.
