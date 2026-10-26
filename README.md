[Leer en español](README.es.md)

<div align="center">

<img src="docs/assets/banner.svg" alt="restful-booker-quality-suite: release-style API testing for Restful Booker with Playwright, TypeScript and Zod" width="100%" />

**A production-shaped API quality framework built with Playwright, TypeScript and Zod — combining lifecycle automation, strict contract validation, negative testing, performance budgets and release-focused reporting.**

[![CI](https://github.com/criguex/restful-booker-quality-suite/actions/workflows/tests.yml/badge.svg)](https://github.com/criguex/restful-booker-quality-suite/actions/workflows/tests.yml)
[![Playwright](https://img.shields.io/badge/Playwright-1.56-2EAD33?logo=playwright&logoColor=white&style=flat-square)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white&style=flat-square)](https://www.typescriptlang.org/)
[![Contracts](https://img.shields.io/badge/contracts-Zod-3068B7?style=flat-square)](https://zod.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-55DFBD?style=flat-square&labelColor=071B2B)](LICENSE)

</div>

---

## 🎯 What this project proves

This repository treats the Restful Booker challenge as a small release, not as a
collection of isolated scripts. It verifies the complete booking lifecycle,
authentication and authorization boundaries, response contracts, compatibility,
data preservation and latency budgets. Tests own their data and clean it even when
an assertion fails.

> **43 automated checks across four independent quality gates.** Eight confirmed
> defects are encoded as expected failures so they remain visible without hiding
> unrelated regressions.

## 🗂️ Quality gates

| Project           | Purpose                                       | Examples                                                  | Command                    |
| ----------------- | --------------------------------------------- | --------------------------------------------------------- | -------------------------- |
| **`api`**         | Functional, integration and negative coverage | CRUD, filters, auth methods, Unicode, forbidden mutations | `npm run test:api`         |
| **`contract`**    | Strict response-shape validation with Zod     | Booking, ID list, creation and authentication schemas     | `npm run test:contract`    |
| **`component`**   | Isolated schema and boundary validation       | Dates, types, prices, names and creation identifiers      | `npm run test:component`   |
| **`performance`** | Lightweight regression budgets                | Health p95 and booking-list latency                       | `npm run test:performance` |

## ✅ Coverage and traceability

| Capability / risk    | Automated evidence                                        | Priority |
| -------------------- | --------------------------------------------------------- | -------: |
| Service availability | `/ping` status and body                                   |       P0 |
| Authentication       | Valid token shape and invalid credentials                 |       P0 |
| Authorization        | Cookie, Basic auth, invalid token and missing credentials |       P0 |
| Booking lifecycle    | Create → retrieve → PUT/PATCH → delete → verify absence   |       P0 |
| Data integrity       | Omitted PATCH fields, zero values, empty optional data    |       P0 |
| Search               | First/last-name filter returns the owned record           |       P1 |
| Compatibility        | JSON, XML and unsupported media types                     |       P1 |
| International data   | Accents, whitespace, apostrophes and Unicode              |       P1 |
| API contracts        | Strict Zod schemas for every core response                |       P1 |
| Performance          | Repeatable p95 and endpoint budgets                       |       P2 |

Full prioritization and release decisions live in
[`docs/TEST_STRATEGY.md`](docs/TEST_STRATEGY.md). Confirmed findings are in
[`docs/DEFECTS.md`](docs/DEFECTS.md). The verified assessment outcome is summarized
in [`docs/EXECUTION_REPORT.md`](docs/EXECUTION_REPORT.md).

## 🔄 How it works

![How the suite runs on every push: pinned Restful Booker in Docker, health check, static gates, four Playwright projects, known defects as expected failures, HTML report](docs/assets/how-it-works.svg)

<p align="center">
  <img src="docs/assets/how-it-works.gif" width="720" alt="Animated replay of the verified run: static gates, four Playwright projects, known defect RB-002 kept as an expected failure, 43 passed" />
</p>

The animation replays the verified run of 16 October 2026 from
[`docs/EXECUTION_REPORT.md`](docs/EXECUTION_REPORT.md); it is rendered from
[`docs/scenes/how-it-works.html`](docs/scenes/how-it-works.html) with
[`docs/scenes/export.sh`](docs/scenes/export.sh) (also as
[`how-it-works.mp4`](docs/assets/how-it-works.mp4)). A vertical short made with Remotion is in
[`restful-booker-quality-short.mp4`](docs/assets/restful-booker-quality-short.mp4), source in
[`showcase/`](showcase). The expanded flow, ownership model and failure paths are documented
in [`docs/TEST_FLOW.md`](docs/TEST_FLOW.md).

## ✨ Engineering highlights

- **Deterministic test ownership** — unique records per test and cleanup in `finally`.
- **Contract-first assertions** — Zod schemas fail with readable field-level drift.
- **Multiple auth paths** — token cookie and Basic authentication are both exercised.
- **Honest known-defect handling** — expected failure becomes an unexpected pass when fixed.
- **Parallel-safe API design** — no dependency on seeded IDs or test execution order.
- **Four CI gates** — functional, contract, component and performance concerns stay independently visible.
- **Failure artifacts** — the HTML report, with traces of failed tests, is uploaded from CI; JUnit XML is written to `test-results/`.
- **Pinned system under test** — CI checks out a known revision and builds it in Docker.
- **Static quality** — ESLint, Prettier and strict TypeScript run before the suites.

## 📁 Structure

```text
restful-booker-quality-suite/
├── src/
│   ├── contracts/bookingSchemas.ts  # Zod source of truth
│   └── support/expectSchema.ts       # Readable contract assertion
├── tests/
│   ├── api/                          # Functional + integration + negative
│   ├── contract/                     # Strict response contracts
│   ├── component/                    # Isolated contract/schema components
│   └── performance/                  # API latency budgets
├── docs/
│   ├── TEST_STRATEGY.md              # Risk model and release policy
│   ├── TEST_FLOW.md                  # Execution and failure-flow diagrams
│   ├── assets/                       # Banner, diagram, GIF/MP4 and vertical short
│   ├── scenes/                       # Source and export script of the GIF
│   └── DEFECTS.md                    # Reproducible confirmed findings
├── showcase/                         # Remotion source of the vertical short
├── .github/workflows/tests.yml       # Docker-backed CI pipeline
├── playwright.config.ts              # Four Playwright projects
└── CONTRIBUTING.md                   # Quality contribution policy
```

## 🚀 Run locally

### 1. Start the system under test

```bash
git clone https://github.com/mwinteringham/restful-booker.git
cd restful-booker
docker compose up --build -d
```

The target should answer at `http://127.0.0.1:3001`.

### 2. Install and execute

```bash
npm ci
npm run quality
```

Target another environment without changing code:

```bash
API_BASE_URL=https://example.test npm test
```

## 🧰 Commands

| Command                    | Purpose                               |
| -------------------------- | ------------------------------------- |
| `npm test`                 | Run every Playwright project          |
| `npm run test:smoke`       | Fast P0 feedback                      |
| `npm run test:api`         | Functional/integration suite          |
| `npm run test:contract`    | Strict Zod contracts                  |
| `npm run test:component`   | Isolated schema component checks      |
| `npm run test:performance` | Latency budgets                       |
| `npm run test:negative`    | Negative and authorization paths      |
| `npm run test:defects`     | Reproduce every confirmed defect      |
| `npm run quality`          | Format, lint, typecheck and all tests |
| `npm run report`           | Open the local HTML report            |

## 🐞 Confirmed findings

Eight reproducible defects cover content negotiation, XML boolean corruption, monetary
precision loss, invalid dates, missing-resource status codes, invalid payload handling
and failed-authentication semantics. See [`docs/DEFECTS.md`](docs/DEFECTS.md) or the
portable [`docs/DEFECTS.html`](docs/DEFECTS.html) report.

## 🔁 CI behavior

For every push and pull request, GitHub Actions:

1. Clones the pinned system under test.
2. Builds and starts it with Docker Compose.
3. Waits for a successful health check.
4. Runs formatting, linting and strict TypeScript checks.
5. Executes all four Playwright projects.
6. Uploads reports and prints target logs on failure.

## 👤 Author

**Cristian Guerra** — Senior QA Automation Engineer · Medellín, Colombia

[GitHub](https://github.com/criguex)

## 📄 License

[MIT](LICENSE)
