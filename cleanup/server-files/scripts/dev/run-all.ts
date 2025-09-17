#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const ARTIFACTS_DIR = path.join(process.cwd(), 'artifacts');

function runCommand(command: string, description: string): void {
  console.log(`\n🔄 ${description}...`);
  console.log(`Running: ${command}`);
  
  try {
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    if (output) {
      console.log(output);
    }
    
    console.log(`✅ ${description} completed successfully`);
  } catch (error: any) {
    console.error(`❌ ${description} failed:`);
    console.error(error.stdout || error.message);
    throw error;
  }
}

function checkArtifacts(): void {
  console.log('\n🔍 Checking generated artifacts...');
  
  const requiredFiles = [
    'openapi.json',
    'endpoints.json',
    'endpoints.md',
    'endpoints.csv',
    'diff.json',
    'diff.md',
    'postman_collection.json',
    'server_upload.zip'
  ];
  
  const missingFiles: string[] = [];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(ARTIFACTS_DIR, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`✅ ${file} (${stats.size} bytes)`);
    } else {
      missingFiles.push(file);
      console.log(`❌ ${file} - MISSING`);
    }
  });
  
  if (missingFiles.length > 0) {
    throw new Error(`Missing required artifacts: ${missingFiles.join(', ')}`);
  }
  
  console.log('✅ All artifacts generated successfully');
}

function validateOpenAPI(): void {
  console.log('\n🔍 Validating OpenAPI schema...');
  
  const openapiFile = path.join(ARTIFACTS_DIR, 'openapi.json');
  const openapi = JSON.parse(fs.readFileSync(openapiFile, 'utf8'));
  
  if (!openapi.openapi || !openapi.info || !openapi.paths) {
    throw new Error('Invalid OpenAPI schema structure');
  }
  
  console.log(`✅ OpenAPI schema is valid`);
  console.log(`   Title: ${openapi.info.title}`);
  console.log(`   Version: ${openapi.info.version}`);
  console.log(`   OpenAPI Version: ${openapi.openapi}`);
  console.log(`   Paths: ${Object.keys(openapi.paths).length}`);
}

function checkStaleEndpoints(): void {
  console.log('\n🔍 Checking for stale endpoints...');
  
  const diffFile = path.join(ARTIFACTS_DIR, 'diff.json');
  const diff = JSON.parse(fs.readFileSync(diffFile, 'utf8'));
  
  if (diff.stale_in_code && diff.stale_in_code.length > 0) {
    console.log(`⚠️  Found ${diff.stale_in_code.length} stale endpoints in code:`);
    diff.stale_in_code.forEach((stale: any) => {
      console.log(`   ${stale.method} ${stale.path} in ${stale.file}:${stale.line}`);
    });
  } else {
    console.log('✅ No stale endpoints found in code');
  }
}

function checkDeprecatedEndpoints(): void {
  console.log('\n🔍 Checking for deprecated endpoints...');
  
  const endpointsFile = path.join(ARTIFACTS_DIR, 'endpoints.json');
  const endpoints = JSON.parse(fs.readFileSync(endpointsFile, 'utf8'));
  
  const deprecated = endpoints.endpoints.filter((ep: any) => ep.deprecated);
  
  if (deprecated.length > 0) {
    console.log(`⚠️  Found ${deprecated.length} deprecated endpoints:`);
    deprecated.forEach((ep: any) => {
      console.log(`   ${ep.method} ${ep.path} (${ep.tag})`);
    });
  } else {
    console.log('✅ No deprecated endpoints found');
  }
}

function printSummary(): void {
  console.log('\n📊 FINAL SUMMARY');
  console.log('================');
  
  try {
    const endpointsFile = path.join(ARTIFACTS_DIR, 'endpoints.json');
    const endpoints = JSON.parse(fs.readFileSync(endpointsFile, 'utf8'));
    
    console.log(`📈 Endpoint Counts:`);
    console.log(`   Total: ${endpoints.counts.total_paths}`);
    console.log(`   Methods: ${Object.entries(endpoints.counts.by_method).map(([method, count]) => `${method}: ${count}`).join(', ')}`);
    console.log(`   Tags: ${Object.entries(endpoints.counts.by_tag).map(([tag, count]) => `${tag}: ${count}`).join(', ')}`);
    console.log(`   Deprecated: ${endpoints.counts.deprecated}`);
    
    console.log(`\n📁 Artifacts Generated:`);
    console.log(`   JSON: ${path.join(ARTIFACTS_DIR, 'endpoints.json')}`);
    console.log(`   Markdown: ${path.join(ARTIFACTS_DIR, 'endpoints.md')}`);
    console.log(`   CSV: ${path.join(ARTIFACTS_DIR, 'endpoints.csv')}`);
    console.log(`   Diff: ${path.join(ARTIFACTS_DIR, 'diff.md')}`);
    console.log(`   Postman: ${path.join(ARTIFACTS_DIR, 'postman_collection.json')}`);
    console.log(`   Bundle: ${path.join(ARTIFACTS_DIR, 'server_upload.zip')}`);
    
    console.log(`\n✅ All tasks completed successfully!`);
    console.log(`📦 Server upload bundle is ready for deployment.`);
    
  } catch (error) {
    console.error('❌ Error generating summary:', error);
  }
}

async function runAll(): Promise<void> {
  console.log('🚀 Starting API Endpoint Inventory Refresh');
  console.log('==========================================');
  
  try {
    // Step 1: Fetch OpenAPI
    runCommand('npm run fetch:openapi', 'Fetching OpenAPI schema');
    
    // Step 2: Generate endpoints
    runCommand('npm run gen:endpoints', 'Generating endpoint inventory');
    
    // Step 3: Diff endpoints
    runCommand('npm run diff:endpoints', 'Comparing endpoints with code usage');
    
    // Step 4: Create bundles
    runCommand('npm run bundle:endpoints', 'Creating server upload bundles');
    
    // Step 5: Validate artifacts
    checkArtifacts();
    validateOpenAPI();
    checkStaleEndpoints();
    checkDeprecatedEndpoints();
    
    // Step 6: Print summary
    printSummary();
    
  } catch (error) {
    console.error('\n❌ Endpoint refresh failed:', error);
    process.exit(1);
  }
}

// Run the script
runAll()
  .then(() => {
    console.log('\n🎉 API endpoint inventory refresh completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 API endpoint inventory refresh failed:', error);
    process.exit(1);
  });

export { runAll };
