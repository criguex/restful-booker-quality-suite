# Test execution flow

```mermaid
sequenceDiagram
  autonumber
  actor Trigger as Developer / GitHub Actions
  participant Docker as Docker Compose
  participant API as Restful Booker
  participant Static as Static quality gates
  participant PW as Playwright orchestrator
  participant Functional as API suite
  participant Contract as Contract suite
  participant Performance as Performance suite
  participant Evidence as Reports and artifacts

  Trigger->>Docker: Start pinned target revision
  Docker->>API: Expose service on port 3001
  Trigger->>API: Poll GET /ping
  alt API does not become ready
    Trigger->>Evidence: Capture container logs
    Evidence-->>Trigger: Fail before tests
  else API is ready
    Trigger->>Static: Prettier + ESLint + TypeScript
    Static-->>Trigger: Source quality result
    Trigger->>PW: Start independent projects
    par Functional and integration
      PW->>Functional: Run auth, CRUD, filters, formats and negative paths
      Functional->>API: Create uniquely named booking
      Functional->>API: Exercise behavior and authorization
      Functional->>API: Cleanup in finally
    and Contract validation
      PW->>Contract: Validate responses against strict Zod schemas
      Contract->>API: Read core resources
    and Performance budgets
      PW->>Performance: Measure p95 and endpoint latency
      Performance->>API: Repeat controlled requests
    end
    PW->>Evidence: HTML + JUnit + traces
    Evidence-->>Trigger: Release gate decision
  end
```

## Failure handling

- Service-start failure stops execution and prints target logs.
- Functional failures retain a Playwright trace and owned data is still cleaned.
- Contract drift reports the exact invalid field instead of weakening the schema.
- RB-001 remains an expected failure until the product fixes its XML content type.
- CI uploads the HTML report regardless of test outcome.
