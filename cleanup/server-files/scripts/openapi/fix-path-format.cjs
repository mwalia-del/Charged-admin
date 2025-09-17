#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

function fixPathFormat() {
  console.log('🔧 Fixing path format...');
  
  const mergedYamlPath = path.join(__dirname, '../../docs/openapi/openapi.merged.yaml');
  
  if (!fs.existsSync(mergedYamlPath)) {
    console.error('❌ openapi.merged.yaml not found');
    process.exit(1);
  }
  
  const content = fs.readFileSync(mergedYamlPath, 'utf8');
  const spec = yaml.parse(content);
  
  let fixedPaths = 0;
  const newPaths = {};
  
  for (const [pathKey, pathItem] of Object.entries(spec.paths || {})) {
    // Fix template variables in paths
    let fixedPath = pathKey
      .replace(/\$\{([^}]+)\}/g, '{$1}')  // Replace ${param} with {param}
      .replace(/\?.*$/, '');              // Remove query string parts
    
    // Ensure path starts with /
    if (!fixedPath.startsWith('/')) {
      fixedPath = '/' + fixedPath;
    }
    
    // Handle special cases
    if (fixedPath.includes('params.toString()')) {
      // These are query parameter endpoints, convert to proper format
      const basePath = fixedPath.replace(/\?.*$/, '');
      fixedPath = basePath;
    }
    
    if (fixedPath !== pathKey) {
      console.log(`  🔄 Fixed path: ${pathKey} → ${fixedPath}`);
      fixedPaths++;
    }
    
    newPaths[fixedPath] = pathItem;
  }
  
  spec.paths = newPaths;
  
  // Write back to file
  const yamlContent = yaml.stringify(spec, {
    indent: 2,
    lineWidth: 120
  });
  
  fs.writeFileSync(mergedYamlPath, yamlContent);
  
  console.log(`✅ Fixed ${fixedPaths} malformed paths`);
}

if (require.main === module) {
  fixPathFormat();
}

module.exports = { fixPathFormat };
