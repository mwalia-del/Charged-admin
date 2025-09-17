#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import archiver from 'archiver';

const ARTIFACTS_DIR = path.join(process.cwd(), 'artifacts');
const OPENAPI_FILE = path.join(ARTIFACTS_DIR, 'openapi.json');
const ENDPOINTS_FILE = path.join(ARTIFACTS_DIR, 'endpoints.json');
const ENDPOINTS_CSV_FILE = path.join(ARTIFACTS_DIR, 'endpoints.csv');
const POSTMAN_FILE = path.join(ARTIFACTS_DIR, 'postman_collection.json');
const SERVER_BUNDLE_FILE = path.join(ARTIFACTS_DIR, 'server_upload.zip');

async function convertToPostman(): Promise<void> {
  console.log('📦 Creating basic Postman collection...');
  
  if (!fs.existsSync(OPENAPI_FILE)) {
    throw new Error(`OpenAPI file not found: ${OPENAPI_FILE}`);
  }
  
  const openapi = JSON.parse(fs.readFileSync(OPENAPI_FILE, 'utf8'));
  
  // Create a basic Postman collection structure
  const postmanCollection: any = {
    info: {
      name: openapi.info.title || 'Charged API',
      description: openapi.info.description || 'API collection generated from OpenAPI spec',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    item: [],
    variable: openapi.servers?.map((server: any) => ({
      key: 'baseUrl',
      value: server.url,
      description: server.description
    })) || []
  };
  
  // Convert paths to Postman requests
  Object.entries(openapi.paths).forEach(([path, pathItem]: [string, any]) => {
    Object.entries(pathItem).forEach(([method, operation]: [string, any]) => {
      if (['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(method)) {
        const request: any = {
          name: operation.summary || `${method.toUpperCase()} ${path}`,
          request: {
            method: method.toUpperCase(),
            header: [],
            url: {
              raw: `{{baseUrl}}${path}`,
              host: ['{{baseUrl}}'],
              path: path.split('/').filter(Boolean)
            }
          }
        };
        
        // Add authentication if required
        if (operation.security) {
          request.request.auth = {
            type: 'bearer',
            bearer: [
              {
                key: 'token',
                value: '{{bearerToken}}',
                type: 'string'
              }
            ]
          };
        }
        
        postmanCollection.item.push(request);
      }
    });
  });
  
  fs.writeFileSync(POSTMAN_FILE, JSON.stringify(postmanCollection, null, 2));
  console.log(`📁 Postman collection saved to: ${POSTMAN_FILE}`);
}

async function createServerBundle(): Promise<void> {
  console.log('📦 Creating server upload bundle...');
  
  const filesToBundle = [
    { path: OPENAPI_FILE, name: 'openapi.json' },
    { path: ENDPOINTS_FILE, name: 'endpoints.json' },
    { path: ENDPOINTS_CSV_FILE, name: 'endpoints.csv' },
    { path: POSTMAN_FILE, name: 'postman_collection.json' }
  ];
  
  // Check all files exist
  const missingFiles = filesToBundle.filter(file => !fs.existsSync(file.path));
  if (missingFiles.length > 0) {
    throw new Error(`Missing files: ${missingFiles.map(f => f.name).join(', ')}`);
  }
  
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(SERVER_BUNDLE_FILE);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    output.on('close', () => {
      console.log(`📁 Server bundle created: ${SERVER_BUNDLE_FILE}`);
      console.log(`📊 Bundle size: ${archive.pointer()} bytes`);
      resolve();
    });
    
    archive.on('error', (err: any) => {
      reject(err);
    });
    
    archive.pipe(output);
    
    // Add files to archive
    filesToBundle.forEach(file => {
      console.log(`   Adding: ${file.name}`);
      archive.file(file.path, { name: file.name });
    });
    
    // Add README
    const readmeContent = `# Charged Admin API Artifacts

Generated: ${new Date().toISOString()}

## Files

- **openapi.json**: Complete OpenAPI 3.0 specification
- **endpoints.json**: Structured endpoint inventory with metadata
- **endpoints.csv**: Endpoint data in CSV format for import
- **postman_collection.json**: Postman collection for API testing

## Usage

1. Import \`openapi.json\` into API documentation tools
2. Use \`endpoints.csv\` for endpoint management systems
3. Import \`postman_collection.json\` into Postman for testing
4. Reference \`endpoints.json\` for programmatic access to endpoint data

## Endpoint Counts

${getEndpointCounts()}
`;
    
    archive.append(readmeContent, { name: 'README.md' });
    
    archive.finalize();
  });
}

function getEndpointCounts(): string {
  try {
    if (!fs.existsSync(ENDPOINTS_FILE)) {
      return 'Endpoint counts not available';
    }
    
    const endpointsData = JSON.parse(fs.readFileSync(ENDPOINTS_FILE, 'utf8'));
    const { counts } = endpointsData;
    
    let countsText = `- Total Endpoints: ${counts.total_paths}\n`;
    countsText += `- Methods: ${Object.entries(counts.by_method).map(([method, count]) => `${method}: ${count}`).join(', ')}\n`;
    countsText += `- Tags: ${Object.entries(counts.by_tag).map(([tag, count]) => `${tag}: ${count}`).join(', ')}\n`;
    countsText += `- Deprecated: ${counts.deprecated}\n`;
    
    return countsText;
  } catch (error) {
    return 'Error reading endpoint counts';
  }
}

async function makeServerBundles(): Promise<void> {
  console.log('📦 Creating server upload bundles...');
  
  // Convert to Postman
  await convertToPostman();
  
  // Create server bundle
  await createServerBundle();
  
  console.log('✅ Server bundles created successfully');
}

// Run the script
makeServerBundles()
  .then(() => {
    console.log('✅ Server bundle creation completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Server bundle creation failed:', error);
    process.exit(1);
  });

export { makeServerBundles };
