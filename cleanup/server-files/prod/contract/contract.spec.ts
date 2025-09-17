import axios, { AxiosResponse } from 'axios';
import SwaggerParser from '@apidevtools/swagger-parser';
import fs from 'fs';
import path from 'path';

interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
  };
  servers: Array<{ url: string; description?: string }>;
  paths: Record<string, Record<string, any>>;
}

interface EndpointTest {
  method: string;
  path: string;
  operationId?: string;
  summary?: string;
  deprecated?: boolean;
  security?: Array<{ [key: string]: string[] }>;
  parameters?: Array<{ name: string; in: string; required?: boolean }>;
  responses?: Record<string, any>;
  requestBody?: any;
}

interface TestResult {
  method: string;
  path: string;
  status: 'passed' | 'failed' | 'skipped';
  statusCode?: number;
  error?: string;
  requiresLiveId?: boolean;
  responseTime?: number;
}

interface ContractSummary {
  timestamp: string;
  baseUrl: string;
  totalEndpoints: number;
  testedEndpoints: number;
  skippedEndpoints: number;
  failedEndpoints: number;
  deprecatedEndpoints: string[];
  results: TestResult[];
  coverage: {
    byMethod: Record<string, number>;
    byStatus: Record<string, number>;
  };
}

describe('Production API Contract Tests', () => {
  let openApiSpec: OpenAPISpec;
  let testResults: TestResult[] = [];
  let contractSummary: ContractSummary;

  beforeAll(async () => {
    console.log('🔍 Fetching OpenAPI specification...');
    
    // Try multiple common OpenAPI endpoints
    const possibleEndpoints = [
      `${global.BASE_URL}/api-docs`,
      `${global.BASE_URL}/api-docs.json`,
      `${global.BASE_URL}/swagger.json`,
      `${global.BASE_URL}/openapi.json`,
      `${global.BASE_URL}/v3/api-docs`
    ];

    let specData: any = null;
    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Trying: ${endpoint}`);
        const response = await axios.get(endpoint, { timeout: 10000 });
        
        if (endpoint.includes('api-docs') && !endpoint.endsWith('.json')) {
          // Try to extract JSON from Swagger UI HTML
          const html = response.data;
          const jsonMatch = html.match(/url:\s*["']([^"']*\.json)["']/);
          if (jsonMatch) {
            const jsonUrl = jsonMatch[1].startsWith('http') ? jsonMatch[1] : `${global.BASE_URL}${jsonMatch[1]}`;
            const jsonResponse = await axios.get(jsonUrl, { timeout: 10000 });
            specData = jsonResponse.data;
            break;
          }
        } else {
          specData = response.data;
          break;
        }
      } catch (error) {
        console.log(`Failed: ${endpoint} - ${error.message}`);
        continue;
      }
    }

    if (!specData) {
      throw new Error('Could not fetch OpenAPI specification from any endpoint');
    }

    // Validate the OpenAPI spec
    try {
      openApiSpec = await SwaggerParser.validate(specData);
      console.log(`✅ OpenAPI spec validated: ${openApiSpec.info.title} v${openApiSpec.info.version}`);
    } catch (error) {
      throw new Error(`Invalid OpenAPI specification: ${error.message}`);
    }

    // Initialize contract summary
    contractSummary = {
      timestamp: new Date().toISOString(),
      baseUrl: global.BASE_URL,
      totalEndpoints: 0,
      testedEndpoints: 0,
      skippedEndpoints: 0,
      failedEndpoints: 0,
      deprecatedEndpoints: [],
      results: [],
      coverage: {
        byMethod: {},
        byStatus: {}
      }
    };
  });

  test('should validate all API endpoints', async () => {
    const endpoints: EndpointTest[] = [];
    
    // Extract all endpoints from OpenAPI spec
    for (const [path, methods] of Object.entries(openApiSpec.paths)) {
      for (const [method, operation] of Object.entries(methods)) {
        if (typeof operation === 'object' && operation !== null) {
          endpoints.push({
            method: method.toUpperCase(),
            path,
            operationId: operation.operationId,
            summary: operation.summary,
            deprecated: operation.deprecated,
            security: operation.security,
            parameters: operation.parameters,
            responses: operation.responses,
            requestBody: operation.requestBody
          });
        }
      }
    }

    contractSummary.totalEndpoints = endpoints.length;
    console.log(`📊 Found ${endpoints.length} endpoints to test`);

    // Test each endpoint
    for (const endpoint of endpoints) {
      const result = await testEndpoint(endpoint);
      testResults.push(result);
      
      // Update counters
      if (result.status === 'passed') {
        contractSummary.testedEndpoints++;
      } else if (result.status === 'skipped') {
        contractSummary.skippedEndpoints++;
      } else {
        contractSummary.failedEndpoints++;
      }

      if (endpoint.deprecated) {
        contractSummary.deprecatedEndpoints.push(`${endpoint.method} ${endpoint.path}`);
      }

      // Update coverage
      contractSummary.coverage.byMethod[endpoint.method] = 
        (contractSummary.coverage.byMethod[endpoint.method] || 0) + 1;
      contractSummary.coverage.byStatus[result.status] = 
        (contractSummary.coverage.byStatus[result.status] || 0) + 1;
    }

    contractSummary.results = testResults;
  });

  afterAll(async () => {
    // Save contract summary
    const artifactsDir = path.join(__dirname, '../artifacts');
    if (!fs.existsSync(artifactsDir)) {
      fs.mkdirSync(artifactsDir, { recursive: true });
    }

    const summaryPath = path.join(artifactsDir, 'contract-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(contractSummary, null, 2));

    // Generate markdown report
    const markdownReport = generateMarkdownReport(contractSummary);
    const reportPath = path.join(artifactsDir, 'contract-report.md');
    fs.writeFileSync(reportPath, markdownReport);

    console.log('📄 Contract summary saved to:', summaryPath);
    console.log('📄 Markdown report saved to:', reportPath);
  });

  async function testEndpoint(endpoint: EndpointTest): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      // Skip if not a safe method and not in allowed write endpoints
      if (!global.testUtils.isSafeMethod(endpoint.method) && 
          !global.testUtils.isWriteEndpoint(endpoint.path)) {
        return {
          method: endpoint.method,
          path: endpoint.path,
          status: 'skipped',
          error: 'Write endpoint not in allowed list'
        };
      }

      // Build request URL with test parameters
      let testPath = endpoint.path;
      const testParams = buildTestParameters(endpoint);
      
      if (testParams.requiresLiveId) {
        return {
          method: endpoint.method,
          path: endpoint.path,
          status: 'skipped',
          requiresLiveId: true,
          error: 'Requires live ID parameters'
        };
      }

      // Add query parameters
      if (testParams.query) {
        const queryString = new URLSearchParams(testParams.query).toString();
        testPath += `?${queryString}`;
      }

      // Prepare request headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'Charged-Admin-Prod-Test/1.0'
      };

      // Add authentication if required
      if (endpoint.security && global.ADMIN_TOKEN_PROD_TEST) {
        headers['Authorization'] = `Bearer ${global.ADMIN_TOKEN_PROD_TEST}`;
      }

      // Make the request
      const response: AxiosResponse = await axios({
        method: endpoint.method,
        url: `${global.BASE_URL}${testPath}`,
        headers,
        timeout: global.TEST_SAFETY.REQUEST_TIMEOUT,
        validateStatus: () => true // Don't throw on any status code
      });

      const responseTime = Date.now() - startTime;

      // Validate response
      const expectedStatusCodes = Object.keys(endpoint.responses || {});
      const isValidStatus = expectedStatusCodes.some(code => 
        response.status.toString().startsWith(code.charAt(0))
      );

      if (!isValidStatus && response.status >= 400) {
        return {
          method: endpoint.method,
          path: endpoint.path,
          status: 'failed',
          statusCode: response.status,
          error: `Unexpected status code: ${response.status}`,
          responseTime
        };
      }

      return {
        method: endpoint.method,
        path: endpoint.path,
        status: 'passed',
        statusCode: response.status,
        responseTime
      };

    } catch (error) {
      return {
        method: endpoint.method,
        path: endpoint.path,
        status: 'failed',
        error: error.message,
        responseTime: Date.now() - startTime
      };
    }
  }

  function buildTestParameters(endpoint: EndpointTest) {
    const params = {
      path: {} as Record<string, string>,
      query: {} as Record<string, string>,
      requiresLiveId: false
    };

    if (!endpoint.parameters) return params;

    for (const param of endpoint.parameters) {
      if (param.in === 'path') {
        // Check if we have test IDs for common parameters
        if (param.name.includes('id') || param.name.includes('Id')) {
          if (param.name.toLowerCase().includes('org') && global.ORG_TEST_ID) {
            params.path[param.name] = global.ORG_TEST_ID;
          } else if (param.name.toLowerCase().includes('rider') && global.RIDER_TEST_ID) {
            params.path[param.name] = global.RIDER_TEST_ID;
          } else if (param.name.toLowerCase().includes('driver') && global.DRIVER_TEST_ID) {
            params.path[param.name] = global.DRIVER_TEST_ID;
          } else {
            params.requiresLiveId = true;
          }
        } else {
          params.requiresLiveId = true;
        }
      } else if (param.in === 'query') {
        // Add safe default query parameters
        if (param.name === 'page') {
          params.query[param.name] = '1';
        } else if (param.name === 'limit' || param.name === 'page_size') {
          params.query[param.name] = '10';
        } else if (param.name === 'status') {
          params.query[param.name] = 'active';
        }
      }
    }

    return params;
  }

  function generateMarkdownReport(summary: ContractSummary): string {
    const { totalEndpoints, testedEndpoints, skippedEndpoints, failedEndpoints, deprecatedEndpoints } = summary;
    
    let report = `# Production API Contract Test Report\n\n`;
    report += `**Generated:** ${summary.timestamp}\n`;
    report += `**Base URL:** ${summary.baseUrl}\n\n`;
    
    report += `## Summary\n\n`;
    report += `- **Total Endpoints:** ${totalEndpoints}\n`;
    report += `- **Tested:** ${testedEndpoints}\n`;
    report += `- **Skipped:** ${skippedEndpoints}\n`;
    report += `- **Failed:** ${failedEndpoints}\n`;
    report += `- **Success Rate:** ${((testedEndpoints / totalEndpoints) * 100).toFixed(1)}%\n\n`;
    
    if (deprecatedEndpoints.length > 0) {
      report += `## Deprecated Endpoints\n\n`;
      deprecatedEndpoints.forEach(endpoint => {
        report += `- ${endpoint}\n`;
      });
      report += `\n`;
    }
    
    report += `## Coverage by Method\n\n`;
    Object.entries(summary.coverage.byMethod).forEach(([method, count]) => {
      report += `- **${method}:** ${count}\n`;
    });
    report += `\n`;
    
    report += `## Failed Tests\n\n`;
    const failedTests = summary.results.filter(r => r.status === 'failed');
    if (failedTests.length === 0) {
      report += `✅ No failed tests\n\n`;
    } else {
      failedTests.forEach(test => {
        report += `- **${test.method} ${test.path}**\n`;
        report += `  - Status: ${test.statusCode}\n`;
        report += `  - Error: ${test.error}\n`;
        report += `  - Response Time: ${test.responseTime}ms\n\n`;
      });
    }
    
    return report;
  }
});
