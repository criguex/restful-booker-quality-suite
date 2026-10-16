# Restful Booker — Detailed defect report

**Target:** `http://127.0.0.1:3001` · **Verified:** 16 October 2026 · **Author:** Cristian Guerra

## Defect classification criteria

An observation is a defect when it violates the documented API contract, HTTP semantics,
content-negotiation rules, input safety, or round-trip data integrity. A surprising response is not
automatically a defect: `/ping` returning 201 and unsupported media types returning 418 remain
clarification points because they may be intentional product behavior.

Run the examples after starting the local Docker environment:

```bash
BASE_URL=http://127.0.0.1:3001
```

## RB-001 — XML response declares the wrong media type

- **Severity / priority:** Medium / P1
- **Why it is a defect:** The client requests XML and receives XML bytes, but the response claims to
  be HTML. `Content-Type` is contractual metadata used to select a parser.
- **Expected:** 200 + XML body + `Content-Type: application/xml`.
- **Actual:** 200 + XML body + `Content-Type: text/html; charset=utf-8`.
- **Impact:** Strict SDKs, gateways and schema validators can reject or incorrectly parse the body.

```bash
BOOKING_ID=$(curl -s "$BASE_URL/booking" | jq -r '.[0].bookingid')
curl -si -H 'Accept: application/xml' "$BASE_URL/booking/$BOOKING_ID"
# Observed: Content-Type: text/html; charset=utf-8, followed by <booking>...</booking>
```

## RB-002 — XML Boolean `false` is persisted as `true`

- **Severity / priority:** High / P1
- **Why it is a defect:** A valid value is silently changed to its logical opposite, violating the
  Boolean contract and round-trip integrity.
- **Expected:** Creation response and later GET retain `depositpaid: false`.
- **Actual:** Both return `depositpaid: true`.
- **Impact:** A booking may be treated as paid when no deposit exists.
- **Likely cause:** The XML string `"false"` appears to be converted with JavaScript `Boolean()`;
  this is an evidence-based hypothesis, not source-code proof.

```bash
curl -si -X POST "$BASE_URL/booking" \
  -H 'Content-Type: application/xml' -H 'Accept: application/json' \
  --data '<booking><firstname>Ana</firstname><lastname>QA</lastname><totalprice>100</totalprice><depositpaid>false</depositpaid><bookingdates><checkin>2026-11-01</checkin><checkout>2026-11-02</checkout></bookingdates><additionalneeds>None</additionalneeds></booking>'
# Sent: false; observed: "depositpaid":true
```

## RB-003 — Decimal prices lose precision

- **Severity / priority:** High / P1
- **Why it is a defect:** `totalprice` is a JSON Number, not a documented integer-only field. The
  server accepts 10.99 but changes it without rejecting or warning the caller.
- **Expected / actual:** `10.99` should round-trip; response and storage contain `10`.
- **Impact:** Incorrect charges, invoices and reconciliation differences.

```bash
curl -s -X POST "$BASE_URL/booking" \
  -H 'Content-Type: application/json' -H 'Accept: application/json' \
  --data '{"firstname":"Ana","lastname":"QA","totalprice":10.99,"depositpaid":false,"bookingdates":{"checkin":"2026-11-01","checkout":"2026-11-02"},"additionalneeds":"None"}' | jq .
# Sent: 10.99; observed: 10
```

## RB-004 — Invalid dates are accepted and serialized as corrupt values

- **Severity / priority:** High / P1
- **Why it is a defect:** An impossible/non-date value cannot satisfy a booking-date contract. The
  API creates a record and can emit `0NaN-aN-aN`, which is neither ISO date nor original input.
- **Expected / actual:** 400 or 422 with no creation; actual response is 200 with corrupt data.
- **Impact:** Availability, date-range search, reports and downstream parsers can fail.

```bash
curl -si -X POST "$BASE_URL/booking" \
  -H 'Content-Type: application/json' -H 'Accept: application/json' \
  --data '{"firstname":"Ana","lastname":"QA","totalprice":100,"depositpaid":false,"bookingdates":{"checkin":"not-a-date","checkout":"2026-02-30"},"additionalneeds":"None"}'
# Observed: HTTP 200; date example: "0NaN-aN-aN"
```

Authentication setup for the next cases:

```bash
TOKEN=$(curl -s -X POST "$BASE_URL/auth" -H 'Content-Type: application/json' \
  --data '{"username":"admin","password":"password123"}' | jq -r .token)
MISSING_ID=999999999
```

## RB-005 — PUT/PATCH of an absent booking returns 405

- **Severity / priority:** Medium / P1
- **Why it is a defect:** PUT and PATCH are supported at this route; 405 incorrectly says the
  method is unsupported. The real condition is an absent resource.
- **Expected / actual:** 404 (or a documented alternative); actual is 405 for both methods.
- **Impact:** Retry logic and diagnostics branch on the wrong failure cause.

```bash
curl -si -X PATCH "$BASE_URL/booking/$MISSING_ID" -H "Cookie: token=$TOKEN" \
  -H 'Content-Type: application/json' --data '{"firstname":"Updated"}'
curl -si -X PUT "$BASE_URL/booking/$MISSING_ID" -H "Cookie: token=$TOKEN" \
  -H 'Content-Type: application/json' \
  --data '{"firstname":"Ana","lastname":"QA","totalprice":100,"depositpaid":false,"bookingdates":{"checkin":"2026-11-01","checkout":"2026-11-02"},"additionalneeds":"None"}'
# Observed for both: HTTP 405 Method Not Allowed
```

## RB-006 — DELETE of an absent booking returns 405

- **Severity / priority:** Medium / P1
- **Why it is a defect:** DELETE is supported at the route. 405 describes an unsupported method,
  not a missing target.
- **Expected / actual:** 404 (or documented idempotent 204); actual is 405.
- **Impact:** Clients cannot distinguish resource absence from unavailable functionality.

```bash
curl -si -X DELETE "$BASE_URL/booking/$MISSING_ID" -H "Cookie: token=$TOKEN"
# Observed: HTTP 405 Method Not Allowed
```

## RB-007 — Missing required fields produce HTTP 500

- **Severity / priority:** Medium / P1
- **Why it is a defect:** The JSON is valid, but required fields are absent. This is a caller
  validation error; 500 incorrectly reports an unexpected server failure.
- **Expected / actual:** 400 or 422 with actionable detail; actual is 500.
- **Impact:** False reliability alarms and unsafe retries of a request that cannot succeed.

```bash
curl -si -X POST "$BASE_URL/booking" -H 'Content-Type: application/json' \
  -H 'Accept: application/json' --data '{"firstname":"Ana"}'
# Observed: HTTP 500 Internal Server Error
```

## RB-008 — Invalid credentials return HTTP 200

- **Severity / priority:** Medium / P1
- **Why it is a defect:** The body says authentication failed while the protocol status says the
  operation succeeded. HTTP status is the primary signal for gateways, monitors and generic clients.
- **Expected / actual:** 401 (or explicitly defined 403); actual is 200 with a failure reason.
- **Impact:** Failed-login metrics are undercounted and callers may continue without a token.

```bash
curl -si -X POST "$BASE_URL/auth" -H 'Content-Type: application/json' \
  --data '{"username":"admin","password":"wrong-password"}'
# Observed: HTTP 200 OK
# {"reason":"Bad credentials"}
```

## Automation and release treatment

Nine Playwright checks reproduce the eight defects (RB-005 has independent PUT and PATCH checks).
They use `test.fail()` so known failures remain visible without disabling the regression pipeline.
When a defect is fixed, Playwright produces an **unexpected pass**, forcing removal of the annotation
and promotion of the corrected behavior into the normal quality gate.

**Recommendation:** no-go for production use involving XML writes, decimal prices or untrusted
dates. RB-002, RB-003 and RB-004 silently corrupt business data. A constrained JSON-only demo is
viable with integer prices, upstream date validation and explicit disclosure of the limitations.
