# Production Cohesion Tests

## Overview
This test suite validates the end-to-end health of the Charged platform in production without impacting real users.

## Safety Rules
- **READ-ONLY by default**: All tests default to GET/HEAD operations
- **Test tenant only**: Any writes use dedicated `ORG_TEST_ID` and test admin account
- **Idempotent writes**: All write operations are tagged and immediately cleaned up
- **No destructive ops**: Never delete, purge, or make irreversible changes
- **Rate limiting**: Maximum 3 concurrent requests
- **Test data tagging**: All created records tagged with `PROD_TEST_<timestamp>`

## Environment Variables Required
```bash
# Production API
BASE_URL=https://api.charged.autos
WS_URL=wss://api.charged.autos/realtime

# Test credentials (DO NOT COMMIT)
ADMIN_TOKEN_PROD_TEST=<jwt for test admin>
ORG_TEST_ID=<uuid of dedicated test org in prod>
RIDER_TEST_ID=<test rider uuid in prod>
DRIVER_TEST_ID=<test driver uuid in prod>
```

## Test Categories

### 1. Contract Tests (`npm run prod:contract`)
- Validates all API endpoints against OpenAPI schema
- Tests authentication and authorization
- Verifies response schemas and status codes
- Identifies deprecated endpoints

### 2. E2E Smoke Tests (`npm run prod:smoke`)
- **Read-only navigation**: Tests all admin dashboard pages
- **Table functionality**: Verifies pagination, filtering, sorting
- **Realtime**: Tests WebSocket connections and message handling
- **Console errors**: Ensures no JavaScript errors

### 3. Minimal Write Tests (`npm run prod:smoke --grep "@writes"`)
- **Promotions**: Creates test promotion, verifies visibility, deactivates
- **Scheduled rides**: Creates test ride, verifies in UI, cancels
- **Cleanup verification**: Ensures all test data is removed

### 4. Accessibility Tests (`npm run prod:ui:a11y`)
- Runs axe-core on critical admin pages
- Reports serious and critical accessibility issues

## Running Tests

### Full Suite
```bash
npm run prod:contract && npm run prod:smoke && npm run prod:ui:a11y
```

### Individual Tests
```bash
# Contract tests only
npm run prod:contract

# E2E smoke tests only
npm run prod:smoke

# Write tests only
npm run prod:smoke --grep "@writes"

# Accessibility tests only
npm run prod:ui:a11y
```

## Output
- **Contract summary**: `tests/prod/artifacts/contract-summary.json`
- **Playwright report**: `tests/prod/artifacts/playwright-report/`
- **Accessibility report**: `tests/prod/artifacts/axe-report.html`
- **Bundled reports**: `tests/prod/artifacts/prod_check_bundle.zip`

## Safety Checklist
- [ ] All writes use `ORG_TEST_ID`
- [ ] All created records tagged with `PROD_TEST_`
- [ ] Cleanup completed for all write operations
- [ ] No real user data modified
- [ ] Rate limits respected
- [ ] Test data isolated to test tenant

## Troubleshooting
- **Authentication failures**: Verify `ADMIN_TOKEN_PROD_TEST` is valid
- **Missing test tenant**: Ensure `ORG_TEST_ID` exists in production
- **Rate limiting**: Reduce concurrency in test configuration
- **Cleanup failures**: Check `tests/prod/artifacts/cleanup-failures.json`
