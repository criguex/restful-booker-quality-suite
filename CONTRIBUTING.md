# Contributing

1. Create a focused branch and keep test data isolated.
2. Run `npm run quality` before opening a pull request.
3. Add or update contract schemas only when the intended API contract changes.
4. A flaky test must be investigated before quarantine. Quarantine requires an issue,
   owner, reason and expiry date.
5. Document confirmed product defects in `docs/DEFECTS.md`; do not weaken assertions
   simply to make CI green.
