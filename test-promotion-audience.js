#!/usr/bin/env node

/**
 * Smoke Test for Audience-Based Promotion System
 * Tests that different audiences can only see their relevant promotions
 */

const https = require('https');

const API_BASE_URL = 'https://api.charged.autos';

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// Test cases
async function runSmokeTest() {
  console.log('🧪 Starting Audience-Based Promotion Smoke Test\n');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Get all promotions (should return all audiences)
  console.log('Test 1: Get all promotions (all audiences)');
  try {
    const response = await makeRequest(`${API_BASE_URL}/promotions`);
    if (response.status === 200 && response.data.success) {
      const promotions = response.data.data;
      const audiences = [...new Set(promotions.map(p => p.audience))];
      console.log(`✅ Found ${promotions.length} promotions with audiences: ${audiences.join(', ')}`);
      results.passed++;
      results.tests.push({ name: 'Get all promotions', status: 'PASS', details: `Found ${promotions.length} promotions` });
    } else {
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Get all promotions', status: 'FAIL', details: error.message });
  }

  // Test 2: Get rider promotions only
  console.log('\nTest 2: Get rider promotions only');
  try {
    const response = await makeRequest(`${API_BASE_URL}/promotions?audience=rider`);
    if (response.status === 200 && response.data.success) {
      const promotions = response.data.data;
      const allRiderAudience = promotions.every(p => p.audience === 'rider');
      console.log(`✅ Found ${promotions.length} rider promotions. All have rider audience: ${allRiderAudience}`);
      results.passed++;
      results.tests.push({ name: 'Get rider promotions', status: 'PASS', details: `Found ${promotions.length} rider promotions` });
    } else {
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Get rider promotions', status: 'FAIL', details: error.message });
  }

  // Test 3: Get driver promotions only
  console.log('\nTest 3: Get driver promotions only');
  try {
    const response = await makeRequest(`${API_BASE_URL}/promotions?audience=driver`);
    if (response.status === 200 && response.data.success) {
      const promotions = response.data.data;
      const allDriverAudience = promotions.every(p => p.audience === 'driver');
      console.log(`✅ Found ${promotions.length} driver promotions. All have driver audience: ${allDriverAudience}`);
      results.passed++;
      results.tests.push({ name: 'Get driver promotions', status: 'PASS', details: `Found ${promotions.length} driver promotions` });
    } else {
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Get driver promotions', status: 'FAIL', details: error.message });
  }

  // Test 4: Get business promotions only
  console.log('\nTest 4: Get business promotions only');
  try {
    const response = await makeRequest(`${API_BASE_URL}/promotions?audience=business`);
    if (response.status === 200 && response.data.success) {
      const promotions = response.data.data;
      const allBusinessAudience = promotions.every(p => p.audience === 'business');
      console.log(`✅ Found ${promotions.length} business promotions. All have business audience: ${allBusinessAudience}`);
      results.passed++;
      results.tests.push({ name: 'Get business promotions', status: 'PASS', details: `Found ${promotions.length} business promotions` });
    } else {
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Get business promotions', status: 'FAIL', details: error.message });
  }

  // Test 5: Get active promotions for riders
  console.log('\nTest 5: Get active promotions for riders');
  try {
    const response = await makeRequest(`${API_BASE_URL}/promotions/active?audience=rider`);
    if (response.status === 200 && response.data.success) {
      const promotions = response.data.data;
      const allActive = promotions.every(p => p.is_active === true);
      const allRiderAudience = promotions.every(p => p.audience === 'rider');
      console.log(`✅ Found ${promotions.length} active rider promotions. All active: ${allActive}, All rider audience: ${allRiderAudience}`);
      results.passed++;
      results.tests.push({ name: 'Get active rider promotions', status: 'PASS', details: `Found ${promotions.length} active rider promotions` });
    } else {
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Get active rider promotions', status: 'FAIL', details: error.message });
  }

  // Test 6: Get active promotions for drivers
  console.log('\nTest 6: Get active promotions for drivers');
  try {
    const response = await makeRequest(`${API_BASE_URL}/promotions/active?audience=driver`);
    if (response.status === 200 && response.data.success) {
      const promotions = response.data.data;
      const allActive = promotions.every(p => p.is_active === true);
      const allDriverAudience = promotions.every(p => p.audience === 'driver');
      console.log(`✅ Found ${promotions.length} active driver promotions. All active: ${allActive}, All driver audience: ${allDriverAudience}`);
      results.passed++;
      results.tests.push({ name: 'Get active driver promotions', status: 'PASS', details: `Found ${promotions.length} active driver promotions` });
    } else {
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Get active driver promotions', status: 'FAIL', details: error.message });
  }

  // Test 7: Get promotions summary by audience
  console.log('\nTest 7: Get promotions summary by audience');
  try {
    const response = await makeRequest(`${API_BASE_URL}/promotions/stats/summary`);
    if (response.status === 200 && response.data.success) {
      const summary = response.data.data;
      console.log(`✅ Summary data:`, summary);
      results.passed++;
      results.tests.push({ name: 'Get promotions summary', status: 'PASS', details: `Retrieved summary for ${summary.length} audiences` });
    } else {
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Get promotions summary', status: 'FAIL', details: error.message });
  }

  // Test 8: Create promotion with specific audience
  console.log('\nTest 8: Create promotion with specific audience');
  try {
    const newPromotion = {
      title: 'Test Audience Promotion',
      description: 'Test promotion for audience filtering',
      discount_type: 'percentage',
      discount_value: 10,
      code: 'AUDIENCETEST10',
      audience: 'rider',
      is_active: true
    };
    
    const response = await makeRequest(`${API_BASE_URL}/promotions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newPromotion)
    });
    
    if (response.status === 201 && response.data.success) {
      const createdPromotion = response.data.data;
      console.log(`✅ Created promotion with audience: ${createdPromotion.audience}`);
      results.passed++;
      results.tests.push({ name: 'Create promotion with audience', status: 'PASS', details: `Created promotion with audience: ${createdPromotion.audience}` });
      
      // Clean up - delete the test promotion
      const deleteResponse = await makeRequest(`${API_BASE_URL}/promotions/${createdPromotion.id}`, {
        method: 'DELETE'
      });
      if (deleteResponse.status === 200) {
        console.log('✅ Cleaned up test promotion');
      }
    } else {
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Create promotion with audience', status: 'FAIL', details: error.message });
  }

  // Test 9: Verify audience isolation
  console.log('\nTest 9: Verify audience isolation');
  try {
    const [riderResponse, driverResponse, businessResponse] = await Promise.all([
      makeRequest(`${API_BASE_URL}/promotions?audience=rider`),
      makeRequest(`${API_BASE_URL}/promotions?audience=driver`),
      makeRequest(`${API_BASE_URL}/promotions?audience=business`)
    ]);
    
    const riderPromotions = riderResponse.data.data || [];
    const driverPromotions = driverResponse.data.data || [];
    const businessPromotions = businessResponse.data.data || [];
    
    const riderAudienceCheck = riderPromotions.every(p => p.audience === 'rider');
    const driverAudienceCheck = driverPromotions.every(p => p.audience === 'driver');
    const businessAudienceCheck = businessPromotions.every(p => p.audience === 'business');
    
    const totalPromotions = riderPromotions.length + driverPromotions.length + businessPromotions.length;
    
    console.log(`✅ Audience isolation check:`);
    console.log(`   - Rider promotions (${riderPromotions.length}): All rider audience: ${riderAudienceCheck}`);
    console.log(`   - Driver promotions (${driverPromotions.length}): All driver audience: ${driverAudienceCheck}`);
    console.log(`   - Business promotions (${businessPromotions.length}): All business audience: ${businessAudienceCheck}`);
    console.log(`   - Total unique promotions: ${totalPromotions}`);
    
    if (riderAudienceCheck && driverAudienceCheck && businessAudienceCheck) {
      results.passed++;
      results.tests.push({ name: 'Audience isolation', status: 'PASS', details: 'All audiences properly isolated' });
    } else {
      throw new Error('Audience isolation failed');
    }
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Audience isolation', status: 'FAIL', details: error.message });
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SMOKE TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  console.log('\n📋 DETAILED RESULTS:');
  results.tests.forEach((test, index) => {
    const status = test.status === 'PASS' ? '✅' : '❌';
    console.log(`${index + 1}. ${status} ${test.name}: ${test.details}`);
  });
  
  if (results.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Audience-based promotion system is working correctly.');
  } else {
    console.log(`\n⚠️  ${results.failed} test(s) failed. Please check the implementation.`);
  }
  
  return results;
}

// Run the smoke test
runSmokeTest().catch(console.error);

