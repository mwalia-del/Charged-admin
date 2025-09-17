#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import SwaggerParser from '@apidevtools/swagger-parser';

interface OpenAPIInfo {
  title: string;
  version: string;
  description?: string;
}

interface OpenAPISchema {
  openapi: string;
  info: OpenAPIInfo;
  servers?: Array<{ url: string; description?: string }>;
  paths: Record<string, any>;
  components?: any;
}

const ARTIFACTS_DIR = path.join(process.cwd(), 'artifacts');
const OPENAPI_FILE = path.join(ARTIFACTS_DIR, 'openapi.json');

// Ensure artifacts directory exists
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

const OPENAPI_ENDPOINTS = [
  'https://api.charged.autos/v3/api-docs',
  'https://api.charged.autos/api-docs.json',
  'https://api.charged.autos/swagger.json',
  'https://api.charged.autos/openapi.json',
  'https://api.charged.autos/api-docs/'
];

async function fetchJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (error) {
          reject(new Error(`Failed to parse JSON from ${url}: ${error}`));
        }
      });
    }).on('error', (error) => {
      reject(new Error(`Failed to fetch ${url}: ${error}`));
    });
  });
}

async function fetchFromSwaggerUI(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          // Look for swagger-ui configuration in the HTML
          const swaggerConfigMatch = data.match(/url:\s*["']([^"']+)["']/);
          if (swaggerConfigMatch) {
            const apiUrl = swaggerConfigMatch[1];
            console.log(`Found API URL in Swagger UI: ${apiUrl}`);
            fetchJson(apiUrl).then(resolve).catch(reject);
          } else {
            reject(new Error(`No API URL found in Swagger UI at ${url}`));
          }
        } catch (error) {
          reject(new Error(`Failed to parse Swagger UI HTML from ${url}: ${error}`));
        }
      });
    }).on('error', (error) => {
      reject(new Error(`Failed to fetch Swagger UI from ${url}: ${error}`));
    });
  });
}

async function validateOpenAPI(schema: any): Promise<OpenAPISchema> {
  try {
    console.log('Validating OpenAPI schema...');
    const validated = await SwaggerParser.validate(schema);
    console.log('✅ OpenAPI schema is valid');
    return validated as OpenAPISchema;
  } catch (error) {
    throw new Error(`OpenAPI validation failed: ${error}`);
  }
}

async function fetchOpenAPI(): Promise<void> {
  console.log('🔍 Fetching OpenAPI schema from live server...');
  
  let schema: any = null;
  let sourceUrl = '';
  
  for (const endpoint of OPENAPI_ENDPOINTS) {
    try {
      console.log(`Trying: ${endpoint}`);
      
      if (endpoint.endsWith('/')) {
        // This is the Swagger UI page, try to extract the JSON URL
        schema = await fetchFromSwaggerUI(endpoint);
      } else {
        // Direct JSON endpoint
        schema = await fetchJson(endpoint);
      }
      
      sourceUrl = endpoint;
      console.log(`✅ Successfully fetched from: ${endpoint}`);
      break;
    } catch (error) {
      console.log(`❌ Failed: ${endpoint} - ${error}`);
      continue;
    }
  }
  
  if (!schema) {
    throw new Error('Failed to fetch OpenAPI schema from any endpoint');
  }
  
  // Validate the schema
  const validatedSchema = await validateOpenAPI(schema);
  
  // Add metadata
  const schemaWithMetadata = {
    ...validatedSchema,
    _metadata: {
      fetched_from: sourceUrl,
      fetched_at: new Date().toISOString(),
      generated_by: 'charged-admin-api-inventory'
    }
  };
  
  // Write to file
  fs.writeFileSync(OPENAPI_FILE, JSON.stringify(schemaWithMetadata, null, 2));
  
  console.log(`📁 OpenAPI schema saved to: ${OPENAPI_FILE}`);
  console.log(`📊 Schema info:`);
  console.log(`   Title: ${validatedSchema.info.title}`);
  console.log(`   Version: ${validatedSchema.info.version}`);
  console.log(`   OpenAPI Version: ${validatedSchema.openapi}`);
  console.log(`   Paths: ${Object.keys(validatedSchema.paths).length}`);
  
  if (validatedSchema.servers) {
    console.log(`   Servers: ${validatedSchema.servers.length}`);
    validatedSchema.servers.forEach((server, index) => {
      console.log(`     ${index + 1}. ${server.url}${server.description ? ` (${server.description})` : ''}`);
    });
  }
}

// Run the script
fetchOpenAPI()
  .then(() => {
    console.log('✅ OpenAPI fetch completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ OpenAPI fetch failed:', error.message);
    process.exit(1);
  });

export { fetchOpenAPI };
