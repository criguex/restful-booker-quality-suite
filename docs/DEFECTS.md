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
