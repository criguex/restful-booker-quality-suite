# Restful Booker Quality Engineering Execution Report

## Executive summary

The Restful Booker API was assessed as a release candidate with emphasis on the
booking lifecycle and the authentication controls requested by CapRelease. The
automated suite executed successfully on 16 October 2026 against a local Docker
instance bound to `127.0.0.1:3001`.

- **Automated checks:** 27
- **Effective result:** 27 passed
- **Confirmed defects:** 1
- **Release blockers:** 0 in the validated scope
- **Static gates:** Prettier, ESLint and strict TypeScript passed
- **CI:** latest GitHub Actions run passed

The single confirmed defect, RB-001, concerns an incorrect response media type for
XML. It is encoded as an expected failure, so it stays visible and becomes an
unexpected pass when the application is fixed.

## Scope

The assessment covers:

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
| Performance                | Health p95 below 500 ms and booking list below 1 second           | Passed |

## Release decision

**Recommendation: release with RB-001 logged.** The validated P0 behavior is healthy:
the API is available, valid authentication succeeds, invalid authorization cannot
mutate records, and the complete booking lifecycle works. RB-001 is a medium-severity
compatibility defect and does not block the JSON-based critical path.

## Confirmed defect

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

## Additional observations

The following behaviors were treated as product or contract decisions to clarify,
not automatically as defects:

- `/ping` returns `201 Created` rather than the conventional `200 OK`.
- Invalid login credentials return HTTP 200 with a reason object.
- An incomplete create payload returns HTTP 500 rather than a 4xx client error.
- An unsupported `Accept` header returns the non-standard HTTP 418 response.

In a production service, these decisions should be documented consistently in the
OpenAPI contract and aligned with client expectations.

## Automation design

The framework uses Playwright with TypeScript and Zod. Tests create unique records,
avoid seeded identifiers and clean owned data in `finally` blocks. Functional,
contract and performance checks run as independent projects. CI starts a pinned
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
without presenting a short assessment as exhaustive coverage.

## Reproduction

```bash
git clone https://github.com/mwinteringham/restful-booker
cd restful-booker
docker compose up --build -d

git clone https://github.com/criguex/restful-booker-quality-suite
cd restful-booker-quality-suite
npm ci
npm run quality
```

The local target must remain bound to `127.0.0.1:3001` and should not contain real or
personal data.
