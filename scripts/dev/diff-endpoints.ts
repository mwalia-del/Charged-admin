#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface CodeUsage {
  method: string;
  path: string;
  file: string;
  line: number;
  context: string;
}

interface DiffResult {
  missing_in_code: Array<{ method: string; path: string; tag: string }>;
  stale_in_code: Array<{ method: string; path: string; file: string; line: number; context: string }>;
  by_file: Record<string, Array<{ method: string; path: string }>>;
}

const ARTIFACTS_DIR = path.join(process.cwd(), 'artifacts');
const ENDPOINTS_FILE = path.join(ARTIFACTS_DIR, 'endpoints.json');
const DIFF_FILE = path.join(ARTIFACTS_DIR, 'diff.json');
const DIFF_MD_FILE = path.join(ARTIFACTS_DIR, 'diff.md');

function normalizePathForComparison(path: string): string {
  // Convert various path formats to a consistent format
  return path
    .replace(/\{[^}]+\}/g, '{id}')  // {rideId} -> {id}
    .replace(/:[^/]+/g, '{id}')     // :rideId -> {id}
    .replace(/\/+/g, '/')           // Remove duplicate slashes
    .replace(/\/$/, '') || '/'      // Remove trailing slash except for root
    .toLowerCase();
}

function extractApiCallsFromCode(): CodeUsage[] {
  console.log('🔍 Scanning codebase for API calls...');
  
  const codeUsages: CodeUsage[] = [];
  
  try {
    // Search for axios calls and fetch calls in src directory
    const grepPatterns = [
      // Axios calls with method
      'axios\\.(get|post|put|patch|delete)',
      // Fetch calls
      'fetch\\s*\\(',
      // API calls with template literals
      '`.*\\$\\{.*\\}.*`',
      // Direct string paths
      '[\'"]/(api|admin|v[0-9]+)/'
    ];
    
    grepPatterns.forEach((pattern, index) => {
      try {
        const result = execSync(`grep -rn "${pattern}" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx"`, { 
          encoding: 'utf8',
          maxBuffer: 10 * 1024 * 1024 // 10MB buffer
        });
        
        const lines = result.split('\n').filter(line => line.trim());
        
        lines.forEach(line => {
          const match = line.match(/^([^:]+):(\d+):(.*)$/);
          if (!match) return;
          
          const [, file, lineNum, context] = match;
          const lineNumber = parseInt(lineNum);
          
          // Extract method and path based on pattern
          let method = 'GET';
          let path = '';
          
          if (index === 0) {
            // Axios method call
            const axiosMatch = context.match(/axios\.(get|post|put|patch|delete|head|options)\s*\(\s*['"`]([^'"`]+)['"`]/);
            if (axiosMatch) {
              method = axiosMatch[1].toUpperCase();
              path = axiosMatch[2];
            }
          } else if (index === 1) {
            // Fetch with method
            const fetchMatch = context.match(/fetch\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*\{[^}]*method\s*:\s*['"`]([^'"`]+)['"`]/);
            if (fetchMatch) {
              path = fetchMatch[1];
              method = fetchMatch[2].toUpperCase();
            }
          } else if (index === 2) {
            // Template literal - extract the path part
            const templateMatch = context.match(/`([^`]*\$\{[^}]+\}[^`]*)`/);
            if (templateMatch) {
              path = templateMatch[1];
              // Try to determine method from context
              if (context.includes('post') || context.includes('POST')) method = 'POST';
              else if (context.includes('put') || context.includes('PUT')) method = 'PUT';
              else if (context.includes('patch') || context.includes('PATCH')) method = 'PATCH';
              else if (context.includes('delete') || context.includes('DELETE')) method = 'DELETE';
            }
          } else if (index === 3) {
            // Direct string path
            const stringMatch = context.match(/['"`]([^'"`]+)['"`]/);
            if (stringMatch) {
              path = stringMatch[1];
              // Try to determine method from context
              if (context.includes('post') || context.includes('POST')) method = 'POST';
              else if (context.includes('put') || context.includes('PUT')) method = 'PUT';
              else if (context.includes('patch') || context.includes('PATCH')) method = 'PATCH';
              else if (context.includes('delete') || context.includes('DELETE')) method = 'DELETE';
            }
          }
          
          if (path && path.startsWith('/')) {
            codeUsages.push({
              method,
              path: normalizePathForComparison(path),
              file,
              line: lineNumber,
              context: context.trim()
            });
          }
        });
      } catch (error) {
        // grep command failed (no matches or other error)
        console.log(`Pattern ${index + 1} found no matches or failed`);
      }
    });
    
    console.log(`Found ${codeUsages.length} API calls in codebase`);
    
  } catch (error) {
    console.error('Error scanning codebase:', error);
  }
  
  return codeUsages;
}

function diffEndpoints(): void {
  console.log('🔍 Comparing endpoints with code usage...');
  
  if (!fs.existsSync(ENDPOINTS_FILE)) {
    throw new Error(`Endpoints file not found: ${ENDPOINTS_FILE}`);
  }
  
  const endpointsData = JSON.parse(fs.readFileSync(ENDPOINTS_FILE, 'utf8'));
  const codeUsages = extractApiCallsFromCode();
  
  // Create lookup maps
  const endpointMap = new Map<string, any>();
  endpointsData.endpoints.forEach((endpoint: any) => {
    const key = `${endpoint.method}:${normalizePathForComparison(endpoint.path)}`;
    endpointMap.set(key, endpoint);
  });
  
  const codeUsageMap = new Map<string, CodeUsage[]>();
  codeUsages.forEach(usage => {
    const key = `${usage.method}:${usage.path}`;
    if (!codeUsageMap.has(key)) {
      codeUsageMap.set(key, []);
    }
    codeUsageMap.get(key)!.push(usage);
  });
  
  // Find missing in code (in schema but not used)
  const missingInCode: Array<{ method: string; path: string; tag: string }> = [];
  endpointMap.forEach((endpoint, key) => {
    if (!codeUsageMap.has(key)) {
      missingInCode.push({
        method: endpoint.method,
        path: endpoint.path,
        tag: endpoint.tag
      });
    }
  });
  
  // Find stale in code (used in code but not in schema)
  const staleInCode: Array<{ method: string; path: string; file: string; line: number; context: string }> = [];
  codeUsageMap.forEach((usages, key) => {
    if (!endpointMap.has(key)) {
      usages.forEach(usage => {
        staleInCode.push({
          method: usage.method,
          path: usage.path,
          file: usage.file,
          line: usage.line,
          context: usage.context
        });
      });
    }
  });
  
  // Group by file
  const byFile: Record<string, Array<{ method: string; path: string }>> = {};
  codeUsages.forEach(usage => {
    if (!byFile[usage.file]) {
      byFile[usage.file] = [];
    }
    byFile[usage.file].push({
      method: usage.method,
      path: usage.path
    });
  });
  
  const diffResult: DiffResult = {
    missing_in_code: missingInCode,
    stale_in_code: staleInCode,
    by_file: byFile
  };
  
  // Write JSON file
  fs.writeFileSync(DIFF_FILE, JSON.stringify(diffResult, null, 2));
  console.log(`📁 Diff JSON saved to: ${DIFF_FILE}`);
  
  // Generate Markdown report
  generateDiffMarkdown(diffResult, endpointsData);
  
  // Print summary
  console.log(`📊 Diff Summary:`);
  console.log(`   Missing in code: ${missingInCode.length}`);
  console.log(`   Stale in code: ${staleInCode.length}`);
  console.log(`   Files with API calls: ${Object.keys(byFile).length}`);
  
  if (staleInCode.length > 0) {
    console.log(`\n⚠️  STALE ENDPOINTS FOUND IN CODE:`);
    staleInCode.forEach(stale => {
      console.log(`   ${stale.method} ${stale.path} in ${stale.file}:${stale.line}`);
    });
  }
}

function generateDiffMarkdown(diff: DiffResult, endpointsData: any): void {
  let markdown = `# API Endpoints Diff Report\n\n`;
  markdown += `**Generated:** ${new Date().toISOString()}\n`;
  markdown += `**Source:** ${endpointsData.info.title} v${endpointsData.info.version}\n\n`;
  
  markdown += `## Summary\n\n`;
  markdown += `- **Missing in Code:** ${diff.missing_in_code.length} endpoints\n`;
  markdown += `- **Stale in Code:** ${diff.stale_in_code.length} endpoints\n`;
  markdown += `- **Files with API Calls:** ${Object.keys(diff.by_file).length}\n\n`;
  
  if (diff.stale_in_code.length > 0) {
    markdown += `## ⚠️ Stale Endpoints in Code\n\n`;
    markdown += `These endpoints are used in the code but not found in the OpenAPI schema:\n\n`;
    markdown += `| Method | Path | File | Line | Context |\n`;
    markdown += `|--------|------|------|------|----------|\n`;
    
    diff.stale_in_code.forEach(stale => {
      markdown += `| ${stale.method} | \`${stale.path}\` | \`${stale.file}\` | ${stale.line} | \`${stale.context.substring(0, 50)}...\` |\n`;
    });
    
    markdown += `\n`;
  }
  
  if (diff.missing_in_code.length > 0) {
    markdown += `## 📋 Missing Endpoints in Code\n\n`;
    markdown += `These endpoints are in the OpenAPI schema but not used in the code:\n\n`;
    markdown += `| Method | Path | Tag |\n`;
    markdown += `|--------|------|-----|\n`;
    
    diff.missing_in_code.forEach(missing => {
      markdown += `| ${missing.method} | \`${missing.path}\` | ${missing.tag} |\n`;
    });
    
    markdown += `\n`;
  }
  
  markdown += `## 📁 API Usage by File\n\n`;
  Object.entries(diff.by_file).forEach(([file, usages]) => {
    markdown += `### ${file}\n\n`;
    markdown += `| Method | Path |\n`;
    markdown += `|--------|------|\n`;
    
    usages.forEach(usage => {
      markdown += `| ${usage.method} | \`${usage.path}\` |\n`;
    });
    
    markdown += `\n`;
  });
  
  fs.writeFileSync(DIFF_MD_FILE, markdown);
  console.log(`📁 Diff Markdown saved to: ${DIFF_MD_FILE}`);
}

// Run the script
try {
  diffEndpoints();
  console.log('✅ Endpoint diff completed successfully');
  process.exit(0);
} catch (error) {
  console.error('❌ Endpoint diff failed:', error);
  process.exit(1);
}

export { diffEndpoints };
