# Restful Booker Quality Engineering Execution Report

## Executive summary

The Restful Booker API was assessed as a release candidate with emphasis on the
booking lifecycle and the authentication controls of the demo scope. The
automated suite executed successfully on 16 October 2026 against a local Docker
instance bound to `127.0.0.1:3001`.

- **Automated checks:** 43
- **Effective result:** 43 passed, including nine controlled expected-failure checks
- **Confirmed defects:** 8
- **Release blockers:** 3 when XML, decimal prices and date integrity are supported
- **Static gates:** Prettier, ESLint and strict TypeScript passed
- **CI:** latest GitHub Actions run passed

All eight confirmed defects are encoded in nine expected-failure checks. They stay visible and
become unexpected passes when the application is fixed, without hiding unrelated
regressions.

## Scope

The demo covers:

- API availability and authentication
- Create, retrieve, full update, partial update and deletion of bookings
- Cookie token and Basic authentication
- Missing and invalid authorization
- Name filters and data preservation
- Unicode, punctuation and whitespace boundaries
- JSON and XML representation behavior
- Unsupported media types and malformed payloads
- Strict runtime response contracts with Zod
- Lightweight endpoint latency budgets

## Result by quality gate

| Quality gate               | Coverage                                                          | Result |
| -------------------------- | ----------------------------------------------------------------- | ------ |
| Static quality             | Prettier, ESLint, TypeScript                                      | Passed |
| Functional and integration | Authentication, CRUD, filters, data integrity                     | Passed |
| Negative and boundaries    | Unauthorized access, invalid payloads, missing resources, Unicode | Passed |
| Contract                   | Booking, ID list, creation and authentication response schemas    | Passed |
| Component                  | Dates, types, prices, names and creation identifiers              | Passed |
| Performance                | Health p95 below 500 ms and booking list below 1 second           | Passed |

## Release decision

**Recommendation: no-go for a production contract that supports XML, decimal prices
or untrusted date input.** RB-002, RB-003 and RB-004 silently corrupt business data.
A constrained JSON-only demonstration can proceed if integer prices and validated
dates are enforced upstream and the remaining status-code defects are logged.

## Confirmed defects

### RB-001 XML response declares the wrong content type

- **Endpoint:** `GET /booking/:id`
- **Precondition:** An existing booking
- **Request:** `Accept: application/xml`
- **Expected:** HTTP 200, XML body and an XML `Content-Type`
- **Actual:** HTTP 200 and XML body with `Content-Type: text/html; charset=utf-8`
- **Impact:** Strict clients, schema validators and content-negotiation middleware may
  reject or incorrectly parse the response.
- **Disposition:** Log as P1 and fix before XML is offered as a supported public
  contract. It is not a blocker for the validated JSON critical path.

| ID     | Severity | Summary                                    | Release position                         |
| ------ | -------- | ------------------------------------------ | ---------------------------------------- |
| RB-002 | High     | XML `false` is stored as `true`            | Block XML release                        |
| RB-003 | High     | Decimal prices are truncated               | Block monetary workflows                 |
| RB-004 | High     | Invalid dates are stored as corrupt values | Block untrusted writes                   |
| RB-005 | Medium   | PUT/PATCH absent target returns 405        | Fix or document before public release    |
| RB-006 | Medium   | DELETE absent target returns 405           | Fix or document before public release    |
| RB-007 | Medium   | Invalid create payload returns 500         | Fix before production observability gate |
| RB-008 | Medium   | Invalid credentials return HTTP 200        | Fix before production auth monitoring    |

Detailed reproduction steps and impact are maintained in
[`DEFECTS.md`](DEFECTS.md).

## Additional observations

The following behaviors still require confirmation of the intended public contract:

- `/ping` returns `201 Created` rather than the conventional `200 OK`.
- An unsupported `Accept` header returns the non-standard HTTP 418 response.

In a production service, these decisions should be documented consistently in the
OpenAPI contract and aligned with client expectations.

## Automation design

The framework uses Playwright with TypeScript and Zod. Tests create unique records,
avoid seeded identifiers and clean owned data in `finally` blocks. Functional,
contract, component and performance checks run as independent projects. CI starts a pinned
Restful Booker revision in Docker, waits for health, runs static gates and tests, and
uploads reports and traces.

## Deliberately excluded

The live exercise is time-boxed, so the following were excluded from the release
gate and recorded for future work:

- Load, soak and concurrency/race testing
- Injection and specialist security testing
- Dependency remediation in the deliberately vulnerable teaching application
- Browser UI and accessibility testing
- Third-party failure simulation and resilience engineering
- Exhaustive date combinations and large-payload boundaries

These exclusions preserve focus on the highest-risk booking and authorization paths
without presenting a short demo as exhaustive coverage.

## Reproduction

```bash
git clone https://github.com/mwinteringham/restful-booker
git clone https://github.com/criguex/restful-booker-quality-suite
docker compose -f restful-booker/docker-compose.yml -f restful-booker-quality-suite/compose.loopback.yml up --build -d

cd restful-booker-quality-suite
npm ci
npm run quality
```

The local target must remain bound to `127.0.0.1:3001` and should not contain real or
personal data.
