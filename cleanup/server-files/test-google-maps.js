const axios = require('axios');

// Test configuration
const BASE_URL = 'https://api.charged.autos';
const TEST_ADDRESS = '1600 Amphitheatre Parkway, Mountain View, CA';
const TEST_COORDINATES = { lat: 37.4220656, lng: -122.0840897 };

// Test functions
async function testGeocoding() {
  console.log('🧪 Testing Geocoding API...');
  try {
    const response = await axios.post(`${BASE_URL}/maps/geocode`, {
      address: TEST_ADDRESS
    });
    
    if (response.data.status) {
      console.log('✅ Geocoding successful');
      console.log('📍 Address:', response.data.data.address);
      console.log('🗺️ Coordinates:', response.data.data.coordinates);
    } else {
      console.log('❌ Geocoding failed:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Geocoding error:', error.response?.data?.message || error.message);
  }
}

async function testReverseGeocoding() {
  console.log('\n🧪 Testing Reverse Geocoding API...');
  try {
    const response = await axios.post(`${BASE_URL}/maps/reverse-geocode`, {
      lat: TEST_COORDINATES.lat,
      lng: TEST_COORDINATES.lng
    });
    
    if (response.data.status) {
      console.log('✅ Reverse geocoding successful');
      console.log('📍 Address:', response.data.data.address);
    } else {
      console.log('❌ Reverse geocoding failed:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Reverse geocoding error:', error.response?.data?.message || error.message);
  }
}

async function testDirections() {
  console.log('\n🧪 Testing Directions API...');
  try {
    const response = await axios.post(`${BASE_URL}/maps/directions`, {
      origin: 'Times Square, New York',
      destination: 'Central Park, New York',
      mode: 'driving'
    });
    
    if (response.data.status) {
      console.log('✅ Directions successful');
      console.log('📏 Distance:', response.data.data.distance.text);
      console.log('⏱️ Duration:', response.data.data.duration.text);
    } else {
      console.log('❌ Directions failed:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Directions error:', error.response?.data?.message || error.message);
  }
}

async function testPlacesSearch() {
  console.log('\n🧪 Testing Places Search API...');
  try {
    const response = await axios.post(`${BASE_URL}/maps/places/search`, {
      query: 'restaurants',
      lat: TEST_COORDINATES.lat,
      lng: TEST_COORDINATES.lng,
      radius: 1000
    });
    
    if (response.data.status) {
      console.log('✅ Places search successful');
      console.log('🏪 Found', response.data.data.length, 'places');
      if (response.data.data.length > 0) {
        console.log('📍 First place:', response.data.data[0].name);
      }
    } else {
      console.log('❌ Places search failed:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Places search error:', error.response?.data?.message || error.message);
  }
}

async function testDistanceCalculation() {
  console.log('\n🧪 Testing Distance Calculation API...');
  try {
    const response = await axios.post(`${BASE_URL}/maps/distance`, {
      origin: { lat: 40.7589, lng: -73.9851 }, // Times Square
      destination: { lat: 40.7829, lng: -73.9654 } // Central Park
    });
    
    if (response.data.status) {
      console.log('✅ Distance calculation successful');
      console.log('📏 Distance:', response.data.data.distance.text);
      console.log('⏱️ Duration:', response.data.data.duration.text);
    } else {
      console.log('❌ Distance calculation failed:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Distance calculation error:', error.response?.data?.message || error.message);
  }
}

async function testLocationUpdate() {
  console.log('\n🧪 Testing Location Update API...');
  try {
    const response = await axios.post(`${BASE_URL}/location/update`, {
      lat: TEST_COORDINATES.lat,
      lng: TEST_COORDINATES.lng,
      address: TEST_ADDRESS
    });
    
    if (response.data.status) {
      console.log('✅ Location update successful');
      console.log('📍 Updated coordinates:', response.data.data.coordinates);
    } else {
      console.log('❌ Location update failed:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Location update error:', error.response?.data?.message || error.message);
  }
}

async function testNearbyDrivers() {
  console.log('\n🧪 Testing Nearby Drivers API...');
  try {
    const response = await axios.post(`${BASE_URL}/location/nearby-drivers`, {
      lat: TEST_COORDINATES.lat,
      lng: TEST_COORDINATES.lng,
      radius: 5000
    });
    
    if (response.data.status) {
      console.log('✅ Nearby drivers search successful');
      console.log('🚗 Found', response.data.data.count, 'drivers');
    } else {
      console.log('❌ Nearby drivers search failed:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Nearby drivers search error:', error.response?.data?.message || error.message);
  }
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting Google Maps API Integration Tests\n');
  console.log('🌐 Base URL:', BASE_URL);
  console.log('📍 Test Address:', TEST_ADDRESS);
  console.log('🗺️ Test Coordinates:', TEST_COORDINATES);
  console.log('=' .repeat(60));
  
  await testGeocoding();
  await testReverseGeocoding();
  await testDirections();
  await testPlacesSearch();
  await testDistanceCalculation();
  await testLocationUpdate();
  await testNearbyDrivers();
  
  console.log('\n' + '=' .repeat(60));
  console.log('🏁 All tests completed!');
  console.log('\n📝 Next Steps:');
  console.log('1. Set up your Google Maps API key in .env file');
  console.log('2. Run database migration: psql -d charged -f migrations/add_location_fields.sql');
  console.log('3. Restart your server');
  console.log('4. Run this test script again to verify integration');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testGeocoding,
  testReverseGeocoding,
  testDirections,
  testPlacesSearch,
  testDistanceCalculation,
  testLocationUpdate,
  testNearbyDrivers,
  runAllTests
};
