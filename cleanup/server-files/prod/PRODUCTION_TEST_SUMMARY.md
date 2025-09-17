# Production Cohesion Test Suite - Complete Implementation

## 🎯 Overview
This comprehensive production test suite validates the end-to-end health of the Charged platform without impacting real users. It includes API contract testing, E2E smoke tests, minimal write tests, and accessibility validation.

## 📁 File Structure
```
tests/prod/
├── README.md                           # Comprehensive documentation
├── jest.contract.config.js             # Jest configuration for contract tests
├── playwright.config.ts                # Playwright configuration for E2E tests
├── setup.ts                           # Global test setup and environment validation
├── .axe.json                          # Accessibility testing configuration
├── env.template                       # Environment variables template
├── contract/
│   └── contract.spec.ts               # API contract validation tests
├── e2e/
│   ├── smoke-admin.spec.ts            # Admin dashboard smoke tests
│   └── minimal-writes.spec.ts         # Safe write tests with test tenant
├── scripts/
│   ├── run-production-tests.js        # Main test runner
│   ├── generate-admin-state.js        # Admin authentication state generator
│   └── bundle-reports.js              # Report bundling utility
├── state/
│   └── admin.json                     # Generated admin authentication state
└── artifacts/                         # Generated test reports and results
    ├── contract-summary.json
    ├── contract-report.md
    ├── playwright-report/
    ├── axe-report.json
    └── prod_check_bundle.zip
```

## 🚀 Quick Start

### 1. Setup Environment
```bash
# Copy environment template
cp tests/prod/env.template .env.prod-test

# Edit .env.prod-test with your production credentials
# Required: ADMIN_TOKEN_PROD_TEST, ORG_TEST_ID
```

### 2. Run All Tests
```bash
npm run prod:test
```

### 3. Run Individual Test Suites
```bash
# API Contract Tests
npm run prod:contract

# E2E Smoke Tests
npm run prod:smoke

# Write Tests (with cleanup)
npm run prod:smoke --grep "@writes"

# Accessibility Tests
npm run prod:ui:a11y

# Bundle Reports
npm run prod:report:bundle
```

## 🔒 Safety Features

### Read-Only by Default
- All tests default to GET/HEAD operations
- Write operations limited to specific endpoints
- Test data tagged with `PROD_TEST_<timestamp>`

### Test Tenant Isolation
- All writes use dedicated `ORG_TEST_ID`
- Test data immediately cleaned up
- No impact on real user data

### Rate Limiting
- Maximum 3 concurrent requests
- Conservative timeouts (30s)
- Sequential test execution

### Comprehensive Cleanup
- All created entities tracked
- Automatic cleanup on test completion
- Manual cleanup instructions if needed

## 📊 Test Coverage

### API Contract Tests
- ✅ Validates all endpoints against OpenAPI schema
- ✅ Tests authentication and authorization
- ✅ Verifies response schemas and status codes
- ✅ Identifies deprecated endpoints
- ✅ Handles missing test IDs gracefully

### E2E Smoke Tests
- ✅ Navigation through all admin menu items
- ✅ Table functionality (pagination, search, filters)
- ✅ WebSocket realtime connection testing
- ✅ Responsive design validation
- ✅ Authentication state verification
- ✅ Console error detection

### Minimal Write Tests
- ✅ Promotion creation and cleanup
- ✅ Scheduled ride creation and cancellation
- ✅ Test data isolation verification
- ✅ Idempotent operations
- ✅ Comprehensive cleanup tracking

### Accessibility Tests
- ✅ WCAG 2.1 AA compliance checking
- ✅ Critical accessibility violations detection
- ✅ Keyboard navigation testing
- ✅ Screen reader compatibility

## 📈 Reporting

### Generated Reports
- **Contract Summary**: JSON and Markdown reports
- **Playwright Report**: Interactive HTML report
- **Accessibility Report**: JSON format with violations
- **Bundled Package**: Complete test results archive

### Metrics Tracked
- API endpoint coverage and success rates
- E2E test pass/fail rates
- Accessibility violation counts
- Test execution times
- Cleanup success rates

## 🛡️ Safety Checklist

### Before Running
- [ ] Environment variables configured
- [ ] Test tenant created in production
- [ ] Admin token valid and has appropriate permissions
- [ ] Rate limits understood and respected

### During Testing
- [ ] All writes use test tenant only
- [ ] Test data properly tagged
- [ ] No real user data modified
- [ ] Cleanup operations successful

### After Testing
- [ ] All test data removed
- [ ] Reports reviewed
- [ ] Issues documented
- [ ] Cleanup failures addressed

## 🔧 Configuration

### Environment Variables
```bash
BASE_URL=https://api.charged.autos
WS_URL=wss://api.charged.autos/realtime
ADMIN_DASHBOARD_URL=https://admin.charged.autos
ADMIN_TOKEN_PROD_TEST=<jwt_token>
ORG_TEST_ID=<test_org_uuid>
RIDER_TEST_ID=<test_rider_uuid>  # Optional
DRIVER_TEST_ID=<test_driver_uuid>  # Optional
```

### Test Configuration
- **Max Concurrent Requests**: 3
- **Request Timeout**: 30 seconds
- **Cleanup Timeout**: 60 seconds
- **Test Tag Prefix**: `PROD_TEST_`

## 🚨 Troubleshooting

### Common Issues
1. **Authentication Failures**: Verify `ADMIN_TOKEN_PROD_TEST` is valid
2. **Missing Test Tenant**: Ensure `ORG_TEST_ID` exists in production
3. **Rate Limiting**: Reduce concurrency in configuration
4. **Cleanup Failures**: Check `cleanup-failures.json` for manual steps

### Debug Mode
```bash
# Run with verbose output
DEBUG=1 npm run prod:test

# Run specific test suite with debug
npm run prod:smoke -- --debug
```

## 📋 Maintenance

### Regular Updates
- Update OpenAPI schema references
- Refresh test tenant data
- Review and update test scenarios
- Monitor for new accessibility requirements

### Performance Monitoring
- Track test execution times
- Monitor API response times
- Review cleanup success rates
- Update rate limiting as needed

## 🎉 Success Criteria

### Test Suite Passes When
- ✅ All API endpoints return expected responses
- ✅ Admin dashboard loads without console errors
- ✅ Navigation works across all menu items
- ✅ Write operations complete and cleanup successfully
- ✅ No critical accessibility violations
- ✅ All test data properly isolated and cleaned up

This production test suite provides comprehensive validation of the Charged platform while maintaining strict safety protocols and ensuring no impact on real users.
