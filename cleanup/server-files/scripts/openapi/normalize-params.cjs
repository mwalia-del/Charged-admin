#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

function normalizeParams() {
  console.log('🔧 Normalizing parameters...');
  
  const mergedYamlPath = path.join(__dirname, '../../docs/openapi/openapi.merged.yaml');
  
  if (!fs.existsSync(mergedYamlPath)) {
    console.error('❌ openapi.merged.yaml not found');
    process.exit(1);
  }
  
  const content = fs.readFileSync(mergedYamlPath, 'utf8');
  const spec = yaml.parse(content);
  
  let fixedParams = 0;
  let removedDuplicates = 0;
  
  // Process all paths
  for (const [pathKey, pathItem] of Object.entries(spec.paths || {})) {
    // Extract path parameters from the path string
    const pathParams = [];
    const pathParamRegex = /\{([^}]+)\}/g;
    let match;
    while ((match = pathParamRegex.exec(pathKey)) !== null) {
      pathParams.push(match[1]);
    }
    
    // Process each operation in the path
    for (const [method, operation] of Object.entries(pathItem)) {
      if (typeof operation === 'object' && operation.operationId) {
        // Only initialize parameters if we have path parameters to add
        if (pathParams.length > 0) {
          if (!operation.parameters) {
            operation.parameters = [];
          }
          
          // Remove duplicate parameters
          const seenParams = new Set();
          const uniqueParams = [];
          for (const param of operation.parameters) {
            const paramKey = `${param.name}-${param.in}`;
            if (!seenParams.has(paramKey)) {
              seenParams.add(paramKey);
              uniqueParams.push(param);
            } else {
              removedDuplicates++;
            }
          }
          operation.parameters = uniqueParams;
          
          // Add missing path parameters
          for (const paramName of pathParams) {
            const hasParam = operation.parameters.some(p => p.name === paramName && p.in === 'path');
            if (!hasParam) {
              operation.parameters.push({
                name: paramName,
                in: 'path',
                required: true,
                schema: {
                  type: 'string'
                }
              });
              fixedParams++;
            }
          }
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
  
  console.log(`✅ Fixed ${fixedParams} missing parameters and removed ${removedDuplicates} duplicates`);
}

if (require.main === module) {
  normalizeParams();
}

module.exports = { normalizeParams };
