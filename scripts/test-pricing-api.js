#!/usr/bin/env node

/**
 * PRICING API DIAGNOSTIC SCRIPT
 * 
 * This script helps diagnose pricing API issues by testing:
 * 1. Server connectivity
 * 2. Authentication
 * 3. Data structure validation
 * 4. CRUD operations
 * 
 * Usage: node scripts/test-pricing-api.js
 */

const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  baseUrl: 'https://api.charged.autos', // Update with actual server URL
  endpoints: {
    list: '/ride/ridetype',
    update: '/ride/ridetype/1', // Test with ID 1
  },
  // Add your actual auth token here
  authToken: 'YOUR_AUTH_TOKEN_HERE',
  timeout: 10000
};

// Test data
const TEST_DATA = {
  base_price: "6.00",
  price_per_km: "2.00",
  price_per_minute: "0.30"
};

// Utility functions
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      timeout: CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.authToken}`,
        ...options.headers
      },
      ...options
    };

    const req = client.request(url, requestOptions, (res) => {
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
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
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
async function testServerConnectivity() {
  console.log('🔍 Testing server connectivity...');
  
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}${CONFIG.endpoints.list}`);
    
    if (response.status === 200) {
      console.log('✅ Server is reachable');
      return true;
    } else if (response.status === 401) {
      console.log('⚠️  Server reachable but authentication required');
      return true;
    } else {
      console.log(`❌ Server returned status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Server connectivity failed: ${error.message}`);
    return false;
  }
}

async function testAuthentication() {
  console.log('🔐 Testing authentication...');
  
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}${CONFIG.endpoints.list}`);
    
    if (response.status === 200) {
      console.log('✅ Authentication successful');
      return true;
    } else if (response.status === 401) {
      console.log('❌ Authentication failed - Invalid token');
      return false;
    } else if (response.status === 403) {
      console.log('❌ Authentication failed - Insufficient permissions');
      return false;
    } else {
      console.log(`⚠️  Unexpected status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Authentication test failed: ${error.message}`);
    return false;
  }
}

async function testDataStructure() {
  console.log('📊 Testing data structure...');
  
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}${CONFIG.endpoints.list}`);
    
    if (response.status === 200 && response.data) {
      console.log('✅ Data received from server');
      console.log('📋 Server response structure:');
      console.log(JSON.stringify(response.data, null, 2));
      
      // Check if data is array
      if (Array.isArray(response.data)) {
        console.log('✅ Data is array format');
        
        if (response.data.length > 0) {
          const firstItem = response.data[0];
          console.log('📋 First item structure:');
          console.log(JSON.stringify(firstItem, null, 2));
          
          // Check required fields
          const requiredFields = ['id', 'name', 'base_price', 'price_per_km'];
          const missingFields = requiredFields.filter(field => !(field in firstItem));
          
          if (missingFields.length === 0) {
            console.log('✅ All required fields present');
          } else {
            console.log(`❌ Missing required fields: ${missingFields.join(', ')}`);
          }
        } else {
          console.log('⚠️  No data items found');
        }
      } else {
        console.log('❌ Data is not array format');
      }
      
      return true;
    } else {
      console.log('❌ No data received from server');
      return false;
    }
  } catch (error) {
    console.log(`❌ Data structure test failed: ${error.message}`);
    return false;
  }
}

async function testUpdateOperation() {
  console.log('✏️  Testing update operation...');
  
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}${CONFIG.endpoints.update}`, {
      method: 'PUT',
      body: TEST_DATA
    });
    
    if (response.status === 200) {
      console.log('✅ Update operation successful');
      console.log('📋 Update response:');
      console.log(JSON.stringify(response.data, null, 2));
      return true;
    } else {
      console.log(`❌ Update operation failed with status: ${response.status}`);
      console.log('📋 Error response:');
      console.log(JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    console.log(`❌ Update operation failed: ${error.message}`);
    return false;
  }
}

// Main execution
async function runDiagnostics() {
  console.log('🚀 Starting Pricing API Diagnostics...\n');
  
  const results = {
    connectivity: await testServerConnectivity(),
    authentication: await testAuthentication(),
    dataStructure: await testDataStructure(),
    updateOperation: await testUpdateOperation()
  };
  
  console.log('\n📊 DIAGNOSTIC RESULTS:');
  console.log('======================');
  console.log(`Server Connectivity: ${results.connectivity ? '✅' : '❌'}`);
  console.log(`Authentication: ${results.authentication ? '✅' : '❌'}`);
  console.log(`Data Structure: ${results.dataStructure ? '✅' : '❌'}`);
  console.log(`Update Operation: ${results.updateOperation ? '✅' : '❌'}`);
  
  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! API integration looks good.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the issues above.');
  }
  
  console.log('\n📝 NEXT STEPS:');
  console.log('1. Update CONFIG.authToken with your actual token');
  console.log('2. Update CONFIG.baseUrl with your actual server URL');
  console.log('3. Run this script again to validate the fixes');
  console.log('4. Share the results with the backend team');
}

// Run diagnostics
runDiagnostics().catch(console.error);
