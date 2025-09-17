#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const { execSync } = require('child_process');

function getGitCommit() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch (error) {
    return null;
  }
}

function stampMetadata() {
  console.log('🔧 Stamping metadata...');
  
  const mergedYamlPath = path.join(__dirname, '../../docs/openapi/openapi.merged.yaml');
  
  if (!fs.existsSync(mergedYamlPath)) {
    console.error('❌ openapi.merged.yaml not found');
    process.exit(1);
  }
  
  const content = fs.readFileSync(mergedYamlPath, 'utf8');
  const spec = yaml.parse(content);
  
  // Generate version with today's date
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '.');
  const version = `${dateStr}-rc.1`;
  
  // Update info
  if (!spec.info) {
    spec.info = {};
  }
  spec.info.version = version;
  
  // Add build metadata
  spec['x-build'] = {
    generatedAt: today.toISOString(),
    commit: getGitCommit()
  };
  
  // Write back to file
  const yamlContent = yaml.stringify(spec, {
    indent: 2,
    lineWidth: 120
  });
  
  fs.writeFileSync(mergedYamlPath, yamlContent);
  
  // Also update the JSON version
  const jsonPath = path.join(__dirname, '../../docs/openapi/openapi.json');
  if (fs.existsSync(jsonPath)) {
    const jsonSpec = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    jsonSpec.info.version = version;
    jsonSpec['x-build'] = spec['x-build'];
    fs.writeFileSync(jsonPath, JSON.stringify(jsonSpec, null, 2));
  }
  
  console.log(`✅ Stamped metadata: version ${version}`);
}

if (require.main === module) {
  stampMetadata();
}

module.exports = { stampMetadata };
