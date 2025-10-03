#!/usr/bin/env node

/**
 * Test script for Parcel Delivery Pricing API endpoints
 * This script tests the admin dashboard parcel delivery pricing integration
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'your-admin-token-here';

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ADMIN_TOKEN}`
  }
});

async function testParcelDeliveryPricingAPI() {
  console.log('🧪 Testing Parcel Delivery Pricing API Integration');
  console.log('=' .repeat(60));
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log(`Admin Token: ${ADMIN_TOKEN.substring(0, 20)}...`);
  console.log('');

  try {
    // Test 1: Get Parcel Delivery Pricing Rules
    console.log('📦 Test 1: Get Parcel Delivery Pricing Rules');
    console.log('GET /admin/parcel-delivery-pricing/standard');
    
    try {
      const response = await instance.get('/admin/parcel-delivery-pricing/standard');
      console.log('✅ Success!');
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ Failed!');
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Error:', error.response.data);
      } else {
        console.log('Error:', error.message);
      }
    }
    console.log('');

    // Test 2: Get WebSocket Information
    console.log('🔌 Test 2: Get WebSocket Information');
    console.log('GET /admin/parcel-delivery-pricing/websocket-info');
    
    try {
      const response = await instance.get('/admin/parcel-delivery-pricing/websocket-info');
      console.log('✅ Success!');
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ Failed!');
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Error:', error.response.data);
      } else {
        console.log('Error:', error.message);
      }
    }
    console.log('');

    // Test 3: Update Parcel Delivery Pricing (if we have pricing data)
    console.log('✏️  Test 3: Update Parcel Delivery Pricing');
    console.log('PUT /admin/parcel-delivery-pricing/standard');
    
    const updateData = {
      base_price: 5.50,
      price_per_km: 1.75,
      price_per_minute: 0.30,
      service_fee: 2.50,
      min_fare: 10.00,
      commission_percentage: 15.00,
      govt_tax_percentage: 13.00,
      description: "Updated standard delivery service via API test"
    };
    
    try {
      const response = await instance.put('/admin/parcel-delivery-pricing/standard', updateData);
      console.log('✅ Success!');
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ Failed!');
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Error:', error.response.data);
      } else {
        console.log('Error:', error.message);
      }
    }
    console.log('');

    // Test 4: Verify the update was applied
    console.log('🔍 Test 4: Verify Update Applied');
    console.log('GET /admin/parcel-delivery-pricing/standard');
    
    try {
      const response = await instance.get('/admin/parcel-delivery-pricing/standard');
      console.log('✅ Success!');
      console.log('Status:', response.status);
      console.log('Updated Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ Failed!');
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Error:', error.response.data);
      } else {
        console.log('Error:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Example calculation test
function testPricingCalculation() {
  console.log('');
  console.log('🧮 Pricing Calculation Example');
  console.log('=' .repeat(40));
  
  const pricing = {
    base_price: 5.50,
    price_per_km: 1.75,
    price_per_minute: 0.30,
    service_fee: 2.50,
    commission_percentage: 15.00,
    govt_tax_percentage: 13.00
  };
  
  const delivery = {
    distance: 5.5, // km
    duration: 15   // minutes
  };
  
  console.log('Pricing Rules:');
  console.log(`- Base Price: $${pricing.base_price} CAD`);
  console.log(`- Price per KM: $${pricing.price_per_km} CAD`);
  console.log(`- Price per Minute: $${pricing.price_per_minute} CAD`);
  console.log(`- Service Fee: $${pricing.service_fee} CAD`);
  console.log(`- Commission: ${pricing.commission_percentage}%`);
  console.log(`- Tax: ${pricing.govt_tax_percentage}%`);
  console.log('');
  
  console.log('Delivery Details:');
  console.log(`- Distance: ${delivery.distance} km`);
  console.log(`- Duration: ${delivery.duration} minutes`);
  console.log('');
  
  // Calculate fare
  const baseFare = pricing.base_price;
  const distanceFare = delivery.distance * pricing.price_per_km;
  const timeFare = delivery.duration * pricing.price_per_minute;
  const serviceFee = pricing.service_fee;
  const subtotal = baseFare + distanceFare + timeFare + serviceFee;
  const tax = subtotal * (pricing.govt_tax_percentage / 100);
  const totalFare = subtotal + tax;
  const platformFee = totalFare * (pricing.commission_percentage / 100);
  const driverEarnings = totalFare - platformFee;
  
  console.log('Fare Calculation:');
  console.log(`- Base Fare: $${baseFare.toFixed(2)} CAD`);
  console.log(`- Distance Fare: $${distanceFare.toFixed(2)} CAD (${delivery.distance} × $${pricing.price_per_km})`);
  console.log(`- Time Fare: $${timeFare.toFixed(2)} CAD (${delivery.duration} × $${pricing.price_per_minute})`);
  console.log(`- Service Fee: $${serviceFee.toFixed(2)} CAD`);
  console.log(`- Subtotal: $${subtotal.toFixed(2)} CAD`);
  console.log(`- Tax: $${tax.toFixed(2)} CAD (${pricing.govt_tax_percentage}%)`);
  console.log(`- Total Fare: $${totalFare.toFixed(2)} CAD`);
  console.log(`- Driver Earnings: $${driverEarnings.toFixed(2)} CAD (${100 - pricing.commission_percentage}%)`);
  console.log(`- Platform Fee: $${platformFee.toFixed(2)} CAD (${pricing.commission_percentage}%)`);
}

// Run tests
if (require.main === module) {
  testParcelDeliveryPricingAPI()
    .then(() => {
      testPricingCalculation();
      console.log('');
      console.log('🎉 Test suite completed!');
    })
    .catch(error => {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = {
  testParcelDeliveryPricingAPI,
  testPricingCalculation
};
