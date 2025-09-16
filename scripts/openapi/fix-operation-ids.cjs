#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

function normalizePathForOperationId(path) {
  return path
    .replace(/\{([^}]+)\}/g, '$1')  // Replace {param} with param
    .replace(/[\/\-]/g, '.')         // Replace / and - with .
    .replace(/[^a-zA-Z0-9.]/g, '')   // Remove special chars except dots
    .replace(/\.+/g, '.')            // Collapse multiple dots
    .replace(/^\.|\.$/g, '');        // Remove leading/trailing dots
}

function generateOperationId(tag, method, path) {
  const normalizedPath = normalizePathForOperationId(path);
  return `${tag.toLowerCase()}.${method.toLowerCase()}.${normalizedPath}`;
}

function fixOperationIds() {
  console.log('🔧 Fixing operation IDs...');
  
  const mergedYamlPath = path.join(__dirname, '../../docs/openapi/openapi.merged.yaml');
  
  if (!fs.existsSync(mergedYamlPath)) {
    console.error('❌ openapi.merged.yaml not found');
    process.exit(1);
  }
  
  const content = fs.readFileSync(mergedYamlPath, 'utf8');
  const spec = yaml.parse(content);
  
  const operationIds = new Map();
  const collisions = new Map();
  
  // First pass: collect all operation IDs and detect collisions
  for (const [pathKey, pathItem] of Object.entries(spec.paths || {})) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (typeof operation === 'object' && operation.operationId) {
        const existing = operationIds.get(operation.operationId);
        if (existing) {
          collisions.set(operation.operationId, (collisions.get(operation.operationId) || 0) + 1);
        } else {
          operationIds.set(operation.operationId, { path: pathKey, method });
        }
      }
    }
  }
  
  // Second pass: fix collisions and missing operation IDs
  for (const [pathKey, pathItem] of Object.entries(spec.paths || {})) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (typeof operation === 'object' && operation.tags && operation.tags.length > 0) {
        const tag = operation.tags[0];
        let operationId = operation.operationId;
        
        if (!operationId) {
          operationId = generateOperationId(tag, method, pathKey);
        }
        
        // Check for collisions and resolve them
        if (operationIds.has(operationId)) {
          const existing = operationIds.get(operationId);
          if (existing.path !== pathKey || existing.method !== method) {
            // This is a collision, generate a new one
            let counter = 1;
            let newOperationId = `${operationId}-${counter}`;
            while (operationIds.has(newOperationId)) {
              counter++;
              newOperationId = `${operationId}-${counter}`;
            }
            operationId = newOperationId;
            console.log(`  🔄 Resolved collision: ${operation.operationId || 'missing'} → ${operationId}`);
          }
        }
        
        operation.operationId = operationId;
        operationIds.set(operationId, { path: pathKey, method });
      }
    }
  }
  
  // Write back to file
  const yamlContent = yaml.stringify(spec, {
    indent: 2,
    lineWidth: 120
  });
  
  fs.writeFileSync(mergedYamlPath, yamlContent);
  
  console.log(`✅ Fixed operation IDs. Found ${collisions.size} collisions.`);
}

if (require.main === module) {
  fixOperationIds();
}

module.exports = { fixOperationIds };
