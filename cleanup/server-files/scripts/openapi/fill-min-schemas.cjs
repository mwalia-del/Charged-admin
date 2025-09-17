#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

function fillMinSchemas() {
  console.log('🔧 Filling minimal schemas...');
  
  const mergedYamlPath = path.join(__dirname, '../../docs/openapi/openapi.merged.yaml');
  
  if (!fs.existsSync(mergedYamlPath)) {
    console.error('❌ openapi.merged.yaml not found');
    process.exit(1);
  }
  
  const content = fs.readFileSync(mergedYamlPath, 'utf8');
  const spec = yaml.parse(content);
  
  // Ensure components.schemas exists
  if (!spec.components) {
    spec.components = {};
  }
  if (!spec.components.schemas) {
    spec.components.schemas = {};
  }
  
  // Add Empty schema if missing
  if (!spec.components.schemas.Empty) {
    spec.components.schemas.Empty = {
      type: 'object',
      description: 'Empty payload'
    };
    console.log('  ➕ Added Empty schema');
  }
  
  let addedRequestBodies = 0;
  let addedResponseSchemas = 0;
  
  // Process all operations
  for (const [pathKey, pathItem] of Object.entries(spec.paths || {})) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (typeof operation === 'object' && operation.operationId) {
        // Add requestBody for write operations if missing
        if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && !operation.requestBody) {
          operation.requestBody = {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  description: 'Request payload'
                }
              }
            }
          };
          addedRequestBodies++;
        }
        
        // Add 200/201 response schema if missing
        const successStatus = method.toUpperCase() === 'POST' ? '201' : '200';
        if (!operation.responses || !operation.responses[successStatus]) {
          if (!operation.responses) {
            operation.responses = {};
          }
          operation.responses[successStatus] = {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Empty'
                }
              }
            }
          };
          addedResponseSchemas++;
        } else if (operation.responses[successStatus] && 
                   operation.responses[successStatus].content && 
                   operation.responses[successStatus].content['application/json'] && 
                   !operation.responses[successStatus].content['application/json'].schema) {
          operation.responses[successStatus].content['application/json'].schema = {
            $ref: '#/components/schemas/Empty'
          };
          addedResponseSchemas++;
        }
      }
    }
  }
  
  // Write back to file
  const yamlContent = yaml.stringify(spec, {
    indent: 2,
    lineWidth: 120
  });
  
  fs.writeFileSync(mergedYamlPath, yamlContent);
  
  console.log(`✅ Added ${addedRequestBodies} request bodies and ${addedResponseSchemas} response schemas`);
}

if (require.main === module) {
  fillMinSchemas();
}

module.exports = { fillMinSchemas };
