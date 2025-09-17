#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

function debugValidation() {
  console.log('🔍 Debugging validation issues...');
  
  const mergedYamlPath = path.join(__dirname, '../../docs/openapi/openapi.merged.yaml');
  
  if (!fs.existsSync(mergedYamlPath)) {
    console.error('❌ openapi.merged.yaml not found');
    process.exit(1);
  }
  
  const content = fs.readFileSync(mergedYamlPath, 'utf8');
  const spec = yaml.parse(content);
  
  console.log('📋 Checking paths structure...');
  
  // Check for invalid path keys
  for (const [pathKey, pathItem] of Object.entries(spec.paths || {})) {
    if (typeof pathItem !== 'object') {
      console.log(`❌ Invalid path item for ${pathKey}: ${typeof pathItem}`);
    } else {
      // Check for invalid operation keys
      for (const [method, operation] of Object.entries(pathItem)) {
        if (!['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'].includes(method.toLowerCase())) {
          console.log(`❌ Invalid method ${method} in path ${pathKey}`);
        }
        if (typeof operation !== 'object') {
          console.log(`❌ Invalid operation for ${method} in path ${pathKey}: ${typeof operation}`);
        }
      }
    }
  }
  
  // Check for additional properties in paths
  const validPathKeys = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace', 'servers', 'parameters'];
  
  for (const [pathKey, pathItem] of Object.entries(spec.paths || {})) {
    if (typeof pathItem === 'object') {
      for (const [key, value] of Object.entries(pathItem)) {
        if (!validPathKeys.includes(key.toLowerCase())) {
          console.log(`❌ Additional property '${key}' in path ${pathKey}`);
        }
      }
    }
  }
  
  console.log('✅ Debug complete');
}

if (require.main === module) {
  debugValidation();
}

module.exports = { debugValidation };
