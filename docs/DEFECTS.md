# Defects found during automation

## RB-001 — XML response declares the wrong content type

- **Severity:** Medium
- **Priority:** P1
- **Endpoint:** `GET /booking/:id`
- **Precondition:** An existing booking
- **Request header:** `Accept: application/xml`
- **Expected:** HTTP 200, XML body and `Content-Type: application/xml`
- **Actual:** HTTP 200 and XML body, but `Content-Type: text/html; charset=utf-8`
- **Impact:** Strict API clients, schema validators and content-negotiation middleware may
  reject or incorrectly parse an otherwise valid response.
- **Automation:** Marked as an expected failure. The suite will flag an unexpected pass
  when the product is fixed, prompting removal of the annotation.

## RB-002 — XML boolean false is persisted as true

- **Severity:** High
- **Priority:** P1
- **Endpoint:** `POST /booking`
- **Request:** Valid XML with `<depositpaid>false</depositpaid>`
- **Expected:** The created booking retains `depositpaid: false`
- **Actual:** The response and stored record contain `depositpaid: true`
- **Impact:** Financial state is silently inverted when XML clients create bookings.
- **Root-cause evidence:** The parser applies JavaScript `Boolean()` to the XML string
  `"false"`, which is truthy.

## RB-003 — Decimal prices lose precision

- **Severity:** High
- **Priority:** P1
- **Endpoint:** `POST /booking` and response serialization
- **Request:** `totalprice: 10.99`
- **Expected:** The documented numeric value is preserved as `10.99`
- **Actual:** The API returns and stores `10`
- **Impact:** Monetary values are silently changed, causing incorrect totals and downstream
  reconciliation errors.
- **Root-cause evidence:** Response parsing uses `parseInt` for a field documented as Number.

## RB-004 — Invalid dates are accepted and returned as corrupt values

- **Severity:** High
- **Priority:** P1
- **Endpoint:** `POST /booking`
- **Request:** Non-date values or impossible dates such as `2026-02-30`
- **Expected:** A 4xx validation response and no record creation
- **Actual:** HTTP 200 with a created record; invalid values can be rendered as
  `0NaN-aN-aN`
- **Impact:** Corrupt booking dates enter persisted data and can break search, reporting and
  fulfilment logic.

## RB-005 — Updating a nonexistent booking returns 405

- **Severity:** Medium
- **Priority:** P1
- **Endpoints:** `PUT /booking/:id` and `PATCH /booking/:id`
- **Expected:** HTTP 404 because the resource does not exist
- **Actual:** HTTP 405 Method Not Allowed
- **Impact:** Clients receive a misleading method-level error and may retry or diagnose the
  request incorrectly.

## RB-006 — Deleting a nonexistent booking returns 405

- **Severity:** Medium
- **Priority:** P1
- **Endpoint:** `DELETE /booking/:id`
- **Expected:** HTTP 404 because the target resource does not exist
- **Actual:** HTTP 405 Method Not Allowed
- **Impact:** Error handling cannot reliably distinguish an absent resource from an unsupported
  operation.

## RB-007 — Invalid create payload returns an internal server error

- **Severity:** Medium
- **Priority:** P1
- **Endpoint:** `POST /booking`
- **Request:** A syntactically valid body missing required booking fields
- **Expected:** A 4xx validation response with a client-actionable error
- **Actual:** HTTP 500 Internal Server Error
- **Impact:** Client mistakes are reported as service failures, polluting reliability metrics and
  encouraging unsafe retries.

## RB-008 — Invalid credentials return HTTP 200

- **Severity:** Medium
- **Priority:** P1
- **Endpoint:** `POST /auth`
- **Request:** Incorrect username or password
- **Expected:** HTTP 401 or 403
- **Actual:** HTTP 200 with `{ "reason": "Bad credentials" }`
- **Impact:** Monitoring, proxies and clients may classify failed authentication as successful,
  weakening audit and alerting signals.
