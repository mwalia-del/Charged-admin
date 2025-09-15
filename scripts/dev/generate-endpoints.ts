#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';

interface EndpointInfo {
  method: string;
  path: string;
  tag: string;
  operationId: string;
  summary: string;
  deprecated: boolean;
  security: string[];
  requestBody: boolean;
  responses: string[];
}

interface EndpointsData {
  info: {
    title: string;
    version: string;
    generated_at: string;
  };
  servers: string[];
  counts: {
    total_paths: number;
    by_method: Record<string, number>;
    by_tag: Record<string, number>;
    deprecated: number;
  };
  endpoints: EndpointInfo[];
}

const ARTIFACTS_DIR = path.join(process.cwd(), 'artifacts');
const OPENAPI_FILE = path.join(ARTIFACTS_DIR, 'openapi.json');
const ENDPOINTS_FILE = path.join(ARTIFACTS_DIR, 'endpoints.json');
const ENDPOINTS_MD_FILE = path.join(ARTIFACTS_DIR, 'endpoints.md');
const ENDPOINTS_CSV_FILE = path.join(ARTIFACTS_DIR, 'endpoints.csv');

function normalizePath(openapiPath: string): string {
  // Convert OpenAPI path parameters to a consistent format
  return openapiPath.replace(/\{[^}]+\}/g, '{id}');
}

function extractSecurity(operation: any): string[] {
  if (!operation.security) return ['public'];
  
  const securityTypes = new Set<string>();
  operation.security.forEach((sec: any) => {
    Object.keys(sec).forEach(key => {
      if (key === 'bearerAuth' || key === 'BearerAuth') {
        securityTypes.add('bearerAuth');
      } else if (key === 'apiKey' || key === 'ApiKey') {
        securityTypes.add('apiKey');
      } else {
        securityTypes.add(key);
      }
    });
  });
  
  return Array.from(securityTypes);
}

function extractResponses(operation: any): string[] {
  if (!operation.responses) return [];
  
  const statusCodes = Object.keys(operation.responses);
  return statusCodes.sort((a, b) => {
    // Sort numeric codes first, then non-numeric
    const aNum = parseInt(a);
    const bNum = parseInt(b);
    
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum;
    }
    if (!isNaN(aNum)) return -1;
    if (!isNaN(bNum)) return 1;
    return a.localeCompare(b);
  });
}

function generateEndpoints(): void {
  console.log('📊 Generating endpoint inventory...');
  
  if (!fs.existsSync(OPENAPI_FILE)) {
    throw new Error(`OpenAPI file not found: ${OPENAPI_FILE}`);
  }
  
  const openapi = JSON.parse(fs.readFileSync(OPENAPI_FILE, 'utf8'));
  const endpoints: EndpointInfo[] = [];
  const counts = {
    total_paths: 0,
    by_method: {} as Record<string, number>,
    by_tag: {} as Record<string, number>,
    deprecated: 0
  };
  
  // Extract servers
  const servers = openapi.servers?.map((s: any) => s.url) || ['https://api.charged.autos'];
  
  // Process each path
  Object.entries(openapi.paths).forEach(([path, pathItem]: [string, any]) => {
    const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];
    
    methods.forEach(method => {
      const operation = pathItem[method];
      if (!operation) return;
      
      const tag = operation.tags?.[0] || 'Untagged';
      const operationId = operation.operationId || `${method}${path.replace(/[^a-zA-Z0-9]/g, '')}`;
      const summary = operation.summary || operation.description || 'No description';
      const deprecated = operation.deprecated || false;
      const security = extractSecurity(operation);
      const requestBody = !!operation.requestBody;
      const responses = extractResponses(operation);
      
      const endpoint: EndpointInfo = {
        method: method.toUpperCase(),
        path: normalizePath(path),
        tag,
        operationId,
        summary,
        deprecated,
        security,
        requestBody,
        responses
      };
      
      endpoints.push(endpoint);
      
      // Update counts
      counts.total_paths++;
      counts.by_method[method.toUpperCase()] = (counts.by_method[method.toUpperCase()] || 0) + 1;
      counts.by_tag[tag] = (counts.by_tag[tag] || 0) + 1;
      if (deprecated) counts.deprecated++;
    });
  });
  
  // Sort endpoints by tag, then by method, then by path
  endpoints.sort((a, b) => {
    if (a.tag !== b.tag) return a.tag.localeCompare(b.tag);
    if (a.method !== b.method) return a.method.localeCompare(b.method);
    return a.path.localeCompare(b.path);
  });
  
  const endpointsData: EndpointsData = {
    info: {
      title: openapi.info.title,
      version: openapi.info.version,
      generated_at: new Date().toISOString()
    },
    servers,
    counts,
    endpoints
  };
  
  // Write JSON file
  fs.writeFileSync(ENDPOINTS_FILE, JSON.stringify(endpointsData, null, 2));
  console.log(`📁 Endpoints JSON saved to: ${ENDPOINTS_FILE}`);
  
  // Generate Markdown table
  generateMarkdownTable(endpointsData);
  
  // Generate CSV file
  generateCSV(endpointsData);
  
  // Print summary
  console.log(`📊 Endpoint Summary:`);
  console.log(`   Total endpoints: ${counts.total_paths}`);
  console.log(`   Methods: ${Object.entries(counts.by_method).map(([method, count]) => `${method}: ${count}`).join(', ')}`);
  console.log(`   Tags: ${Object.entries(counts.by_tag).map(([tag, count]) => `${tag}: ${count}`).join(', ')}`);
  console.log(`   Deprecated: ${counts.deprecated}`);
}

function generateMarkdownTable(data: EndpointsData): void {
  const { endpoints, counts } = data;
  
  let markdown = `# API Endpoints Inventory\n\n`;
  markdown += `**Generated:** ${data.info.generated_at}\n`;
  markdown += `**Source:** ${data.info.title} v${data.info.version}\n\n`;
  
  markdown += `## Summary\n\n`;
  markdown += `- **Total Endpoints:** ${counts.total_paths}\n`;
  markdown += `- **Methods:** ${Object.entries(counts.by_method).map(([method, count]) => `${method}: ${count}`).join(', ')}\n`;
  markdown += `- **Tags:** ${Object.entries(counts.by_tag).map(([tag, count]) => `${tag}: ${count}`).join(', ')}\n`;
  markdown += `- **Deprecated:** ${counts.deprecated}\n\n`;
  
  // Group by tag
  const groupedByTag = endpoints.reduce((acc, endpoint) => {
    if (!acc[endpoint.tag]) acc[endpoint.tag] = [];
    acc[endpoint.tag].push(endpoint);
    return acc;
  }, {} as Record<string, EndpointInfo[]>);
  
  Object.entries(groupedByTag).forEach(([tag, tagEndpoints]) => {
    markdown += `## ${tag}\n\n`;
    markdown += `| Method | Path | Operation ID | Summary | Deprecated | Security | Request Body | Responses |\n`;
    markdown += `|--------|------|--------------|---------|------------|----------|--------------|----------|\n`;
    
    tagEndpoints.forEach(endpoint => {
      const deprecated = endpoint.deprecated ? '⚠️ **YES**' : 'No';
      const security = endpoint.security.join(', ');
      const requestBody = endpoint.requestBody ? 'Yes' : 'No';
      const responses = endpoint.responses.join(', ');
      
      markdown += `| ${endpoint.method} | \`${endpoint.path}\` | \`${endpoint.operationId}\` | ${endpoint.summary} | ${deprecated} | ${security} | ${requestBody} | ${responses} |\n`;
    });
    
    markdown += `\n`;
  });
  
  fs.writeFileSync(ENDPOINTS_MD_FILE, markdown);
  console.log(`📁 Endpoints Markdown saved to: ${ENDPOINTS_MD_FILE}`);
}

function generateCSV(data: EndpointsData): void {
  const { endpoints } = data;
  
  let csv = 'method,path,tag,operationId,summary,deprecated,security,responses\n';
  
  endpoints.forEach(endpoint => {
    const row = [
      endpoint.method,
      `"${endpoint.path}"`,
      `"${endpoint.tag}"`,
      `"${endpoint.operationId}"`,
      `"${endpoint.summary.replace(/"/g, '""')}"`,
      endpoint.deprecated ? 'true' : 'false',
      `"${endpoint.security.join(',')}"`,
      `"${endpoint.responses.join(',')}"`
    ].join(',');
    
    csv += row + '\n';
  });
  
  fs.writeFileSync(ENDPOINTS_CSV_FILE, csv);
  console.log(`📁 Endpoints CSV saved to: ${ENDPOINTS_CSV_FILE}`);
}

// Run the script
try {
  generateEndpoints();
  console.log('✅ Endpoint generation completed successfully');
  process.exit(0);
} catch (error) {
  console.error('❌ Endpoint generation failed:', error);
  process.exit(1);
}

export { generateEndpoints };
