#!/usr/bin/env ts-node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const SwaggerParser = require('@apidevtools/swagger-parser');

async function validateOpenAPI(): Promise<void> {
  console.log('🔍 Validating OpenAPI specifications...');
  
  const mergedYamlPath = path.join(__dirname, '../../docs/openapi/openapi.merged.yaml');
  const jsonPath = path.join(__dirname, '../../docs/openapi/openapi.json');
  
  if (!fs.existsSync(mergedYamlPath)) {
    throw new Error(`Merged YAML file not found: ${mergedYamlPath}`);
  }
  
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`JSON file not found: ${jsonPath}`);
  }
  
  let hasErrors = false;
  
  // Validate with swagger-parser
  console.log('📋 Validating with swagger-parser...');
  try {
    const api = await SwaggerParser.validate(jsonPath);
    console.log('✅ swagger-parser validation passed');
    
    // Print basic stats
    const pathCount = Object.keys(api.paths || {}).length;
    const operationCount = Object.values(api.paths || {}).reduce((total: number, pathItem: any) => {
      return total + Object.keys(pathItem).filter(key => 
        ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(key)
      ).length;
    }, 0);
    
    console.log(`📊 API Statistics:`);
    console.log(`  Title: ${api.info?.title || 'Unknown'}`);
    console.log(`  Version: ${api.info?.version || 'Unknown'}`);
    console.log(`  Paths: ${pathCount}`);
    console.log(`  Operations: ${operationCount}`);
    
  } catch (error) {
    console.error('❌ swagger-parser validation failed:');
    console.error(error instanceof Error ? error.message : String(error));
    hasErrors = true;
  }
  
  // Validate with Spectral (optional)
  console.log('\n📋 Validating with Spectral...');
  try {
    const spectralOutput = execSync(`npx spectral lint "${mergedYamlPath}" --ruleset @stoplight/spectral/rulesets/oas`, {
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    if (spectralOutput.trim()) {
      console.log('⚠️  Spectral warnings/errors:');
      console.log(spectralOutput);
    } else {
      console.log('✅ Spectral validation passed');
    }
  } catch (error) {
    console.log('⚠️  Spectral validation skipped (ruleset not found)');
  }
  
  // Check for common issues
  console.log('\n🔍 Checking for common issues...');
  const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  
  const issues: string[] = [];
  
  // Check for missing operation IDs
  Object.entries(jsonContent.paths || {}).forEach(([path, pathItem]: [string, any]) => {
    Object.entries(pathItem).forEach(([method, operation]: [string, any]) => {
      if (['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(method)) {
        if (!operation.operationId) {
          issues.push(`Missing operationId: ${method.toUpperCase()} ${path}`);
        }
        if (!operation.summary) {
          issues.push(`Missing summary: ${method.toUpperCase()} ${path}`);
        }
        if (!operation.tags || operation.tags.length === 0) {
          issues.push(`Missing tags: ${method.toUpperCase()} ${path}`);
        }
      }
    });
  });
  
  // Check for duplicate operation IDs
  const operationIds = new Set<string>();
  Object.values(jsonContent.paths || {}).forEach((pathItem: any) => {
    Object.values(pathItem).forEach((operation: any) => {
      if (operation.operationId) {
        if (operationIds.has(operation.operationId)) {
          issues.push(`Duplicate operationId: ${operation.operationId}`);
        }
        operationIds.add(operation.operationId);
      }
    });
  });
  
  // Check for missing security schemes
  if (!jsonContent.components?.securitySchemes) {
    issues.push('Missing security schemes in components');
  }
  
  // Check for missing error responses
  Object.entries(jsonContent.paths || {}).forEach(([path, pathItem]: [string, any]) => {
    Object.entries(pathItem).forEach(([method, operation]: [string, any]) => {
      if (['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(method)) {
        const responses = operation.responses || {};
        if (!responses['400'] && !responses['4xx']) {
          issues.push(`Missing 4xx error response: ${method.toUpperCase()} ${path}`);
        }
        if (!responses['500'] && !responses['5xx']) {
          issues.push(`Missing 5xx error response: ${method.toUpperCase()} ${path}`);
        }
      }
    });
  });
  
  if (issues.length > 0) {
    console.log('⚠️  Found issues:');
    issues.forEach(issue => console.log(`  - ${issue}`));
  } else {
    console.log('✅ No common issues found');
  }
  
  // Print final summary
  console.log('\n📋 Validation Summary:');
  if (hasErrors) {
    console.log('❌ Validation failed - please fix errors before proceeding');
    process.exit(1);
  } else {
    console.log('✅ All validations passed');
  }
}

if (require.main === module) {
  validateOpenAPI().catch(console.error);
}

export { validateOpenAPI };
