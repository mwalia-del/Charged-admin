import { config } from 'dotenv';
import path from 'path';

// Load production test environment variables
config({ path: path.resolve(__dirname, '../../.env.prod-test') });

// Global test configuration
global.BASE_URL = process.env.BASE_URL || 'https://api.charged.autos';
global.WS_URL = process.env.WS_URL || 'wss://api.charged.autos/realtime';
global.ADMIN_TOKEN_PROD_TEST = process.env.ADMIN_TOKEN_PROD_TEST;
global.ORG_TEST_ID = process.env.ORG_TEST_ID;
global.RIDER_TEST_ID = process.env.RIDER_TEST_ID;
global.DRIVER_TEST_ID = process.env.DRIVER_TEST_ID;

// Validate required environment variables
const requiredEnvVars = [
  'ADMIN_TOKEN_PROD_TEST',
  'ORG_TEST_ID'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.warn(`⚠️  Missing required environment variables: ${missingVars.join(', ')}`);
  console.warn('Some tests may be skipped or fail.');
}

// Test safety configuration
global.TEST_SAFETY = {
  MAX_CONCURRENT_REQUESTS: 3,
  REQUEST_TIMEOUT: 30000,
  CLEANUP_TIMEOUT: 60000,
  TEST_TAG_PREFIX: 'PROD_TEST_',
  ALLOWED_WRITE_ENDPOINTS: [
    '/admin/promotions',
    '/admin/scheduled-rides'
  ]
};

// Global test utilities
global.testUtils = {
  generateTestTag: () => `PROD_TEST_${Date.now()}`,
  isWriteEndpoint: (path: string) => {
    return global.TEST_SAFETY.ALLOWED_WRITE_ENDPOINTS.some(endpoint => 
      path.includes(endpoint)
    );
  },
  isSafeMethod: (method: string) => {
    return ['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase());
  }
};

console.log('🧪 Production test environment initialized');
console.log(`📍 Base URL: ${global.BASE_URL}`);
console.log(`🔐 Admin token: ${global.ADMIN_TOKEN_PROD_TEST ? '✅ Set' : '❌ Missing'}`);
console.log(`🏢 Test org: ${global.ORG_TEST_ID || '❌ Missing'}`);
