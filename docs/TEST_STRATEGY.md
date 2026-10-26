# Test strategy

## Objective

Provide fast release confidence for the Restful Booker API while exposing contract,
authorization, data integrity and compatibility risks. The suite is designed for a
short demo and can grow into a CI regression pack.

## Risk model

| Risk                                     |   Impact | Priority | Automated coverage                            |
| ---------------------------------------- | -------: | -------: | --------------------------------------------- |
| Unauthorized modification/deletion       | Critical |       P0 | PUT/PATCH/DELETE without credentials          |
| Booking lifecycle corruption             |     High |       P0 | Create, retrieve, full/partial update, delete |
| Authentication regression                |     High |       P0 | Valid and invalid credentials                 |
| Contract or status-code drift            |     High |       P1 | JSON shapes, identifiers and response codes   |
| Search returns wrong records             |   Medium |       P1 | First/last-name filters                       |
| Content negotiation failure              |   Medium |       P1 | JSON, XML and unsupported `Accept`            |
| Date-boundary/filter defects             |   Medium |       P1 | Planned exploratory/contract expansion        |
| Concurrency and duplicate updates        |     High |       P2 | Planned load/race suite                       |
| Injection, abuse and dependency exposure | Critical |       P2 | Manual security review; specialist tooling    |

## Layers

1. **Smoke:** health, authentication and one complete create/read path.
2. **API regression:** CRUD, filters, authorization and content negotiation.
3. **Negative/contract:** missing records, invalid credentials, malformed payloads,
   unsupported formats and unauthorized mutations.
4. **Exploratory:** boundary values, dates, encodings, concurrent writes, state reset,
   error consistency and documentation drift.
5. **Non-functional:** latency percentiles, soak/load, dependency/security scanning and
   resilience. Keep these separate from the deterministic merge gate.

## Release policy

- Block release on health/auth failure, unauthorized mutation, loss/corruption of a
  booking, or inability to create/read/update/delete with supported credentials.
- Log but assess contextually: inconsistent non-critical error wording, unsupported
  media-type behavior, documentation/status-code mismatches and cosmetic docs defects.
- Quarantine only after proving environmental flakiness; every quarantine requires an
  owner, issue and expiry date. Retries gather evidence but do not redefine a pass.

## Test data and isolation

- Each test creates uniquely named data and deletes it in `finally`.
- Tests never depend on seeded booking IDs.
- Cleanup accepts “already absent” only for teardown, never for assertions.
- Production endpoints and real customer data are out of scope.

## Confirmed defect themes

- XML media types and boolean values are handled incorrectly.
- Decimal monetary values lose precision.
- Invalid dates can be persisted as corrupt values.
- Missing update and delete targets return 405 instead of 404.
- Invalid create data returns HTTP 500 instead of a client error.
- Bad credentials return HTTP 200 rather than an authentication error status.

`/ping` returning 201 and unsupported `Accept` values returning 418 remain
product-contract clarifications rather than release blockers for this demo. The
application also ships intentionally vulnerable dependencies; do not auto-fix the
target of this demo because doing so changes the system under test.
