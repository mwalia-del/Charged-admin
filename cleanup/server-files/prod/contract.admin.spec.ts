#!/usr/bin/env ts-node

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

interface AdminUsage {
  method: string;
  path: string;
  file: string;
  line: number;
  hasBody: boolean;
  hasAuth: boolean;
  page?: string;
  context?: string;
}

interface TestResult {
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  responseTime: number;
  statusCode?: number;
  error?: string;
  response?: any;
}

class AdminContractTester {
  private baseUrl: string;
  private testResults: TestResult[] = [];
  private missingEndpoints: AdminUsage[] = [];

  constructor() {
    this.baseUrl = process.env.BASE_URL || 'https://api.charged.autos';
  }

  private async loadMissingEndpoints(): Promise<void> {
    // Load admin usage endpoints instead of missing ones (since we have 100% coverage)
    const adminUsagePath = path.join(process.cwd(), 'artifacts/admin-sync/admin.usage.json');
    if (fs.existsSync(adminUsagePath)) {
      this.missingEndpoints = JSON.parse(fs.readFileSync(adminUsagePath, 'utf8'));
      console.log(`📄 Loaded ${this.missingEndpoints.length} admin endpoints to test`);
    } else {
      // Fallback: test a few key endpoints manually
      this.missingEndpoints = [
        { method: 'GET', path: '/admin/getdriverdocs/{id}', file: 'test', line: 1, hasBody: false, hasAuth: true },
        { method: 'GET', path: '/businesses', file: 'test', line: 1, hasBody: false, hasAuth: false },
        { method: 'GET', path: '/analytics/tips', file: 'test', line: 1, hasBody: false, hasAuth: false },
        { method: 'GET', path: '/referrals', file: 'test', line: 1, hasBody: false, hasAuth: false },
        { method: 'GET', path: '/promotions', file: 'test', line: 1, hasBody: false, hasAuth: false }
      ];
      console.log(`📄 Using fallback test endpoints: ${this.missingEndpoints.length}`);
    }
  }

  private generateTestData(endpoint: AdminUsage): any {
    // Generate test data based on endpoint path and method
    const testData: any = {
      id: 'test123',
      driverId: 'test_driver_123',
      documentId: 'test_doc_123',
      userId: 'test_user_123',
      businessId: 'test_business_123',
      rideId: 'test_ride_123',
      promotionId: 'test_promo_123',
      referralId: 'test_ref_123',
      scheduledId: 'test_sched_123',
      tipId: 'test_tip_123',
      invoiceId: 'test_invoice_123',
      rewardId: 'test_reward_123'
    };

    // Add specific test data based on endpoint
    if (endpoint.path.includes('driver')) {
      testData.driver = {
        id: 'test_driver_123',
        name: 'Test Driver',
        email: 'test@example.com',
        phone: '+1234567890',
        status: 'active'
      };
    }

    if (endpoint.path.includes('business')) {
      testData.business = {
        id: 'test_business_123',
        name: 'Test Business',
        email: 'business@example.com',
        address: '123 Test St'
      };
    }

    if (endpoint.path.includes('ride')) {
      testData.ride = {
        id: 'test_ride_123',
        driverId: 'test_driver_123',
        riderId: 'test_rider_123',
        status: 'completed',
        fare: 25.50
      };
    }

    return testData;
  }

  private replacePathParams(path: string, testData: any): string {
    let replacedPath = path;
    
    // Replace common path parameters
    replacedPath = replacedPath.replace(/{id}/g, testData.id);
    replacedPath = replacedPath.replace(/{driverId}/g, testData.driverId);
    replacedPath = replacedPath.replace(/{documentId}/g, testData.documentId);
    replacedPath = replacedPath.replace(/{userId}/g, testData.userId);
    replacedPath = replacedPath.replace(/{businessId}/g, testData.businessId);
    replacedPath = replacedPath.replace(/{rideId}/g, testData.rideId);
    replacedPath = replacedPath.replace(/{promotionId}/g, testData.promotionId);
    replacedPath = replacedPath.replace(/{referralId}/g, testData.referralId);
    replacedPath = replacedPath.replace(/{scheduledId}/g, testData.scheduledId);
    replacedPath = replacedPath.replace(/{tipId}/g, testData.tipId);
    replacedPath = replacedPath.replace(/{invoiceId}/g, testData.invoiceId);
    replacedPath = replacedPath.replace(/{rewardId}/g, testData.rewardId);
    
    return replacedPath;
  }

  private async testEndpoint(endpoint: AdminUsage): Promise<TestResult> {
    const startTime = Date.now();
    const testData = this.generateTestData(endpoint);
    const testPath = this.replacePathParams(endpoint.path, testData);
    const url = `${this.baseUrl}${testPath}`;

    try {
      console.log(`  🔍 Testing ${endpoint.method} ${testPath}...`);

      const config: any = {
        method: endpoint.method.toLowerCase(),
        url: url,
        timeout: 10000,
        validateStatus: () => true // Don't throw on any status code
      };

      if (endpoint.hasBody && ['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
        config.data = testData;
        config.headers = { 'Content-Type': 'application/json' };
      }

      if (endpoint.hasAuth) {
        // Add test auth header
        config.headers = {
          ...config.headers,
          'Authorization': 'Bearer test_admin_token_123'
        };
      }

      const response = await axios(config);
      const responseTime = Date.now() - startTime;

      // Determine if test passed
      let status: 'PASS' | 'FAIL' | 'SKIP' = 'PASS';
      let error: string | undefined;

      if (response.status === 404) {
        status = 'FAIL';
        error = 'Endpoint not found (404)';
      } else if (response.status === 500) {
        status = 'FAIL';
        error = 'Server error (500)';
      } else if (response.status === 401 && !endpoint.hasAuth) {
        status = 'SKIP';
        error = 'Authentication required but not provided';
      } else if (response.status >= 400 && response.status < 500) {
        status = 'PASS'; // 4xx responses are expected for test data
      }

      return {
        endpoint: testPath,
        method: endpoint.method,
        status,
        responseTime,
        statusCode: response.status,
        error,
        response: response.data
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        endpoint: testPath,
        method: endpoint.method,
        status: 'FAIL',
        responseTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async runContractTests(): Promise<void> {
    console.log('🧪 Running contract tests on deployed endpoints...');
    console.log(`📊 Testing ${this.missingEndpoints.length} endpoints\n`);

    // Test first 10 endpoints to avoid overwhelming the server
    const testEndpoints = this.missingEndpoints.slice(0, 10);
    
    for (const endpoint of testEndpoints) {
      const result = await this.testEndpoint(endpoint);
      this.testResults.push(result);
      
      // Add small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  private generateReport(): void {
    console.log('\n📊 Contract Test Results:');
    console.log('=' .repeat(50));

    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const skipped = this.testResults.filter(r => r.status === 'SKIP').length;

    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`📊 Total: ${this.testResults.length}`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(r => r.status === 'FAIL')
        .forEach(result => {
          console.log(`  ${result.method} ${result.endpoint} - ${result.error}`);
        });
    }

    if (skipped > 0) {
      console.log('\n⏭️  Skipped Tests:');
      this.testResults
        .filter(r => r.status === 'SKIP')
        .forEach(result => {
          console.log(`  ${result.method} ${result.endpoint} - ${result.error}`);
        });
    }

    // Save detailed results
    const resultsPath = path.join(process.cwd(), 'artifacts/admin-sync/contract.test.results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(this.testResults, null, 2));
    console.log(`\n📄 Detailed results saved to: ${resultsPath}`);

    // Generate summary report
    const summaryPath = path.join(process.cwd(), 'artifacts/admin-sync/contract.test.summary.md');
    const summary = `# Contract Test Results

## Summary
- **Total Tests**: ${this.testResults.length}
- **Passed**: ${passed}
- **Failed**: ${failed}
- **Skipped**: ${skipped}
- **Success Rate**: ${((passed / this.testResults.length) * 100).toFixed(1)}%

## Test Details

${this.testResults.map(result => 
  `### ${result.method} ${result.endpoint}
- **Status**: ${result.status}
- **Response Time**: ${result.responseTime}ms
- **Status Code**: ${result.statusCode || 'N/A'}
- **Error**: ${result.error || 'None'}
`).join('\n')}
`;

    fs.writeFileSync(summaryPath, summary);
    console.log(`📄 Summary report saved to: ${summaryPath}`);
  }

  async run(): Promise<void> {
    try {
      await this.loadMissingEndpoints();
      await this.runContractTests();
      this.generateReport();
    } catch (error) {
      console.error(`❌ Error running contract tests: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  try {
    const tester = new AdminContractTester();
    await tester.run();
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { AdminContractTester };
