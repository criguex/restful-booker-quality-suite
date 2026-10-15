# Restful Booker Quality Suite

Risk-based Playwright API automation for the Restful Booker technical assessment.

## Run locally

Start the target API first:

```bash
cd /Users/cristianguerragomez/Projects/interviews/restful-booker
docker compose up -d
```

Then run the suite:

```bash
npm ci
npm test
```

Useful commands:

```bash
npm run test:smoke
npm run test:regression
npm run test:negative
npm run typecheck
npm run report
```

Override the target with `API_BASE_URL`, for example:

```bash
API_BASE_URL=http://127.0.0.1:3001 npm test
```

See [docs/TEST_STRATEGY.md](docs/TEST_STRATEGY.md) for risks, scope and release policy.
Confirmed product findings are tracked in [docs/DEFECTS.md](docs/DEFECTS.md).
