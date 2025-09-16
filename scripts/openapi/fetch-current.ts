#!/usr/bin/env ts-node

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'https://api.charged.autos';
const OUTPUT_DIR = path.join(__dirname, '../../docs/openapi/artifacts');

async function fetchCurrentOpenAPI(): Promise<void> {
  console.log('🔍 Fetching current OpenAPI spec from production...');
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const endpoints = [
    '/v3/api-docs',
    '/api-docs',
    '/api-docs.json',
    '/openapi.json'
  ];

  let found = false;
  
  for (const endpoint of endpoints) {
    try {
      console.log(`  Trying ${API_BASE_URL}${endpoint}...`);
      const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json, application/yaml, */*'
        }
      });

      if (response.status === 200 && response.data) {
        const outputPath = path.join(OUTPUT_DIR, 'current.openapi.json');
        fs.writeFileSync(outputPath, JSON.stringify(response.data, null, 2));
        console.log(`✅ Current OpenAPI spec saved to: ${outputPath}`);
        found = true;
        break;
      }
    } catch (error) {
      console.log(`  ❌ Failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (!found) {
    console.log('⚠️  No current OpenAPI spec found - this is expected for new APIs');
    // Create an empty file to indicate we tried
    const outputPath = path.join(OUTPUT_DIR, 'current.openapi.json');
    fs.writeFileSync(outputPath, JSON.stringify({ info: { title: 'No current spec found' } }, null, 2));
  }
}

if (require.main === module) {
  fetchCurrentOpenAPI().catch(console.error);
}

export { fetchCurrentOpenAPI };
