const fs = require('fs');
const path = require('path');

function generateAdminState() {
  const adminToken = process.env.ADMIN_TOKEN_PROD_TEST;
  
  if (!adminToken) {
    console.error('❌ ADMIN_TOKEN_PROD_TEST environment variable is required');
    process.exit(1);
  }
  
  const stateDir = path.join(__dirname, '../state');
  if (!fs.existsSync(stateDir)) {
    fs.mkdirSync(stateDir, { recursive: true });
  }
  
  // Generate Playwright storage state
  const storageState = {
    cookies: [],
    origins: [
      {
        origin: process.env.ADMIN_DASHBOARD_URL || 'https://admin.charged.autos',
        localStorage: [
          {
            name: 'authToken',
            value: adminToken
          },
          {
            name: 'userRole',
            value: 'admin'
          }
        ],
        sessionStorage: [],
        indexedDB: [],
        databases: []
      }
    ]
  };
  
  const statePath = path.join(stateDir, 'admin.json');
  fs.writeFileSync(statePath, JSON.stringify(storageState, null, 2));
  
  console.log(`✅ Admin state generated: ${statePath}`);
  console.log(`🔐 Token: ${adminToken.substring(0, 20)}...`);
}

if (require.main === module) {
  generateAdminState();
}

module.exports = { generateAdminState };
