#!/usr/bin/env node

/**
 * SERVER CONNECTIVITY TEST
 * 
 * This script tests the current server status and validates
 * the endpoints mentioned in the integration report.
 * 
 * Usage: node scripts/test-server-connectivity.js
 */

const https = require('https');

// Server configuration from integration report
const SERVER_CONFIG = {
  baseUrl: 'https://api.charged.autos',
  endpoints: {
    health: '/api/health',
    pricing: '/ride/ridetype',
    vehicleClasses: '/catalog/vehicle-classes',
    websocket: '/test-websocket'
  },
  timeout: 10000
};

// Test results storage
const testResults = {
  serverReachable: false,
  endpoints: {},
  errors: [],
  timestamp: new Date().toISOString()
};

// Utility function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      timeout: SERVER_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    const req = https.request(url, requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
            rawData: data
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
            rawData: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Test functions
async function testServerHealth() {
  console.log('🏥 Testing server health...');
  
  try {
    const response = await makeRequest(`${SERVER_CONFIG.baseUrl}${SERVER_CONFIG.endpoints.health}`);
    
    if (response.status === 200) {
      console.log('✅ Server health check passed');
      testResults.serverReachable = true;
      testResults.endpoints.health = {
        status: 'success',
        response: response.data
      };
      return true;
    } else {
      console.log(`❌ Server health check failed with status: ${response.status}`);
      testResults.endpoints.health = {
        status: 'error',
        statusCode: response.status,
        response: response.data
      };
      return false;
    }
  } catch (error) {
    console.log(`❌ Server health check failed: ${error.message}`);
    testResults.endpoints.health = {
      status: 'error',
      error: error.message
    };
    testResults.errors.push(`Health check: ${error.message}`);
    return false;
  }
}

async function testPricingEndpoint() {
  console.log('💰 Testing pricing rules endpoint...');
  
  try {
    const response = await makeRequest(`${SERVER_CONFIG.baseUrl}${SERVER_CONFIG.endpoints.pricing}`);
    
    if (response.status === 200) {
      console.log('✅ Pricing rules endpoint working');
      
      // Validate response structure
      const data = response.data;
      if (data && data.data && Array.isArray(data.data)) {
        console.log(`📊 Found ${data.data.length} pricing rules`);
        
        // Check first rule structure
        if (data.data.length > 0) {
          const firstRule = data.data[0];
          const requiredFields = ['id', 'name', 'base_price', 'price_per_km', 'price_per_minute'];
          const missingFields = requiredFields.filter(field => !(field in firstRule));
          
          if (missingFields.length === 0) {
            console.log('✅ Pricing rules data structure is valid');
          } else {
            console.log(`⚠️  Missing fields in pricing rules: ${missingFields.join(', ')}`);
          }
        }
      } else {
        console.log('⚠️  Pricing rules data structure unexpected');
      }
      
      testResults.endpoints.pricing = {
        status: 'success',
        response: data,
        ruleCount: data.data ? data.data.length : 0
      };
      return true;
    } else {
      console.log(`❌ Pricing rules endpoint failed with status: ${response.status}`);
      testResults.endpoints.pricing = {
        status: 'error',
        statusCode: response.status,
        response: response.data
      };
      return false;
    }
  } catch (error) {
    console.log(`❌ Pricing rules endpoint failed: ${error.message}`);
    testResults.endpoints.pricing = {
      status: 'error',
      error: error.message
    };
    testResults.errors.push(`Pricing endpoint: ${error.message}`);
    return false;
  }
}

async function testVehicleClassesEndpoint() {
  console.log('🚗 Testing vehicle classes endpoint...');
  
  try {
    const response = await makeRequest(`${SERVER_CONFIG.baseUrl}${SERVER_CONFIG.endpoints.vehicleClasses}`);
    
    if (response.status === 200) {
      console.log('✅ Vehicle classes endpoint working');
      
      // Validate response structure
      const data = response.data;
      if (data && data.vehicle_classes && Array.isArray(data.vehicle_classes)) {
        console.log(`📊 Found ${data.vehicle_classes.length} vehicle classes`);
        
        // Check first class structure
        if (data.vehicle_classes.length > 0) {
          const firstClass = data.vehicle_classes[0];
          const requiredFields = ['id', 'code', 'display_name', 'is_enabled'];
          const missingFields = requiredFields.filter(field => !(field in firstClass));
          
          if (missingFields.length === 0) {
            console.log('✅ Vehicle classes data structure is valid');
          } else {
            console.log(`⚠️  Missing fields in vehicle classes: ${missingFields.join(', ')}`);
          }
        }
      } else {
        console.log('⚠️  Vehicle classes data structure unexpected');
      }
      
      testResults.endpoints.vehicleClasses = {
        status: 'success',
        response: data,
        classCount: data.vehicle_classes ? data.vehicle_classes.length : 0
      };
      return true;
    } else {
      console.log(`❌ Vehicle classes endpoint failed with status: ${response.status}`);
      testResults.endpoints.vehicleClasses = {
        status: 'error',
        statusCode: response.status,
        response: response.data
      };
      return false;
    }
  } catch (error) {
    console.log(`❌ Vehicle classes endpoint failed: ${error.message}`);
    testResults.endpoints.vehicleClasses = {
      status: 'error',
      error: error.message
    };
    testResults.errors.push(`Vehicle classes endpoint: ${error.message}`);
    return false;
  }
}

async function testWebSocketEndpoint() {
  console.log('🔌 Testing WebSocket endpoint...');
  
  try {
    const response = await makeRequest(`${SERVER_CONFIG.baseUrl}${SERVER_CONFIG.endpoints.websocket}`);
    
    if (response.status === 200) {
      console.log('✅ WebSocket endpoint working');
      
      const data = response.data;
      if (data && data.status) {
        console.log(`📊 WebSocket server status: ${data.status}`);
        if (data.connected_clients !== undefined) {
          console.log(`📊 Connected clients: ${data.connected_clients}`);
        }
      }
      
      testResults.endpoints.websocket = {
        status: 'success',
        response: data
      };
      return true;
    } else {
      console.log(`❌ WebSocket endpoint failed with status: ${response.status}`);
      testResults.endpoints.websocket = {
        status: 'error',
        statusCode: response.status,
        response: response.data
      };
      return false;
    }
  } catch (error) {
    console.log(`❌ WebSocket endpoint failed: ${error.message}`);
    testResults.endpoints.websocket = {
      status: 'error',
      error: error.message
    };
    testResults.errors.push(`WebSocket endpoint: ${error.message}`);
    return false;
  }
}

// Test authentication endpoints (will likely fail without tokens)
async function testAuthEndpoints() {
  console.log('🔐 Testing authentication endpoints...');
  
  const authEndpoints = [
    { method: 'PUT', path: '/ride/ridetype/1', name: 'Update Pricing Rule' },
    { method: 'POST', path: '/ride/ridetype', name: 'Create Pricing Rule' },
    { method: 'DELETE', path: '/ride/ridetype/1', name: 'Delete Pricing Rule' },
    { method: 'PATCH', path: '/catalog/vehicle-classes/charged_x', name: 'Update Vehicle Class' }
  ];
  
  for (const endpoint of authEndpoints) {
    try {
      const response = await makeRequest(`${SERVER_CONFIG.baseUrl}${endpoint.path}`, {
        method: endpoint.method,
        body: endpoint.method === 'POST' ? { name: 'Test Rule' } : 
              endpoint.method === 'PATCH' ? { is_enabled: false } : undefined
      });
      
      if (response.status === 401) {
        console.log(`✅ ${endpoint.name}: Authentication required (expected)`);
        testResults.endpoints[endpoint.name] = {
          status: 'auth_required',
          statusCode: response.status
        };
      } else if (response.status === 200 || response.status === 201) {
        console.log(`⚠️  ${endpoint.name}: No authentication required (unexpected)`);
        testResults.endpoints[endpoint.name] = {
          status: 'no_auth',
          statusCode: response.status
        };
      } else {
        console.log(`❌ ${endpoint.name}: Unexpected status ${response.status}`);
        testResults.endpoints[endpoint.name] = {
          status: 'error',
          statusCode: response.status
        };
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.message}`);
      testResults.endpoints[endpoint.name] = {
        status: 'error',
        error: error.message
      };
    }
  }
}

// Main execution
async function runServerTests() {
  console.log('🚀 Starting Server Connectivity Tests...\n');
  console.log(`🌐 Testing server: ${SERVER_CONFIG.baseUrl}\n`);
  
  // Run all tests
  await testServerHealth();
  await testPricingEndpoint();
  await testVehicleClassesEndpoint();
  await testWebSocketEndpoint();
  await testAuthEndpoints();
  
  // Generate summary
  console.log('\n📊 TEST SUMMARY:');
  console.log('================');
  console.log(`Server Reachable: ${testResults.serverReachable ? '✅' : '❌'}`);
  console.log(`Pricing Rules: ${testResults.endpoints.pricing?.status === 'success' ? '✅' : '❌'}`);
  console.log(`Vehicle Classes: ${testResults.endpoints.vehicleClasses?.status === 'success' ? '✅' : '❌'}`);
  console.log(`WebSocket: ${testResults.endpoints.websocket?.status === 'success' ? '✅' : '❌'}`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ ERRORS FOUND:');
    testResults.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  // Save results to file
  const fs = require('fs');
  const resultsFile = 'server-test-results.json';
  fs.writeFileSync(resultsFile, JSON.stringify(testResults, null, 2));
  console.log(`\n📄 Results saved to: ${resultsFile}`);
  
  // Generate recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('===================');
  
  if (!testResults.serverReachable) {
    console.log('🔴 CRITICAL: Server is not reachable - check network connectivity');
  }
  
  if (testResults.endpoints.pricing?.status !== 'success') {
    console.log('🔴 CRITICAL: Pricing rules endpoint not working - check backend deployment');
  }
  
  if (testResults.endpoints.vehicleClasses?.status !== 'success') {
    console.log('🟡 WARNING: Vehicle classes endpoint not working - check backend deployment');
  }
  
  if (testResults.endpoints.websocket?.status !== 'success') {
    console.log('🟡 WARNING: WebSocket endpoint not working - check WebSocket server');
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Share these results with the backend team');
  console.log('2. Address any critical issues identified');
  console.log('3. Test authentication endpoints with valid tokens');
  console.log('4. Validate data persistence for update operations');
}

// Run tests
runServerTests().catch(console.error);
