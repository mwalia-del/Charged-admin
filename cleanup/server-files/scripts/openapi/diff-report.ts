#!/usr/bin/env ts-node

const fs = require('fs');
const path = require('path');

interface EndpointInfo {
  method: string;
  path: string;
  operationId?: string;
  summary?: string;
  tags?: string[];
}

interface DiffReport {
  added: EndpointInfo[];
  removed: EndpointInfo[];
  changed: Array<{
    method: string;
    path: string;
    changes: string[];
  }>;
  summary: {
    totalAdded: number;
    totalRemoved: number;
    totalChanged: number;
    totalEndpoints: number;
  };
}

function extractEndpoints(spec: any): EndpointInfo[] {
  const endpoints: EndpointInfo[] = [];
  
  if (!spec.paths) return endpoints;
  
  Object.entries(spec.paths).forEach(([path, pathItem]: [string, any]) => {
    Object.entries(pathItem).forEach(([method, operation]: [string, any]) => {
      if (['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(method)) {
        endpoints.push({
          method: method.toUpperCase(),
          path,
          operationId: operation.operationId,
          summary: operation.summary,
          tags: operation.tags
        });
      }
    });
  });
  
  return endpoints;
}

function compareEndpoints(oldEndpoints: EndpointInfo[], newEndpoints: EndpointInfo[]): DiffReport {
  const oldMap = new Map(oldEndpoints.map(ep => [`${ep.method} ${ep.path}`, ep]));
  const newMap = new Map(newEndpoints.map(ep => [`${ep.method} ${ep.path}`, ep]));
  
  const added: EndpointInfo[] = [];
  const removed: EndpointInfo[] = [];
  const changed: Array<{ method: string; path: string; changes: string[] }> = [];
  
  // Find added endpoints
  for (const [key, newEp] of newMap) {
    if (!oldMap.has(key)) {
      added.push(newEp);
    }
  }
  
  // Find removed endpoints
  for (const [key, oldEp] of oldMap) {
    if (!newMap.has(key)) {
      removed.push(oldEp);
    }
  }
  
  // Find changed endpoints
  for (const [key, newEp] of newMap) {
    const oldEp = oldMap.get(key);
    if (oldEp) {
      const changes: string[] = [];
      
      if (oldEp.operationId !== newEp.operationId) {
        changes.push(`operationId: "${oldEp.operationId}" → "${newEp.operationId}"`);
      }
      if (oldEp.summary !== newEp.summary) {
        changes.push(`summary: "${oldEp.summary}" → "${newEp.summary}"`);
      }
      if (JSON.stringify(oldEp.tags) !== JSON.stringify(newEp.tags)) {
        changes.push(`tags: ${JSON.stringify(oldEp.tags)} → ${JSON.stringify(newEp.tags)}`);
      }
      
      if (changes.length > 0) {
        changed.push({
          method: newEp.method,
          path: newEp.path,
          changes
        });
      }
    }
  }
  
  return {
    added,
    removed,
    changed,
    summary: {
      totalAdded: added.length,
      totalRemoved: removed.length,
      totalChanged: changed.length,
      totalEndpoints: newEndpoints.length
    }
  };
}

function generateMarkdownReport(diff: DiffReport): string {
  const timestamp = new Date().toISOString();
  
  let markdown = `# OpenAPI Diff Report\n\n`;
  markdown += `**Generated:** ${timestamp}\n\n`;
  
  // Summary
  markdown += `## Summary\n\n`;
  markdown += `- **Total Endpoints:** ${diff.summary.totalEndpoints}\n`;
  markdown += `- **Added:** ${diff.summary.totalAdded}\n`;
  markdown += `- **Removed:** ${diff.summary.totalRemoved}\n`;
  markdown += `- **Changed:** ${diff.summary.totalChanged}\n\n`;
  
  // Added endpoints
  if (diff.added.length > 0) {
    markdown += `## Added Endpoints\n\n`;
    diff.added.forEach(ep => {
      markdown += `- **${ep.method}** \`${ep.path}\`\n`;
      if (ep.summary) {
        markdown += `  - Summary: ${ep.summary}\n`;
      }
      if (ep.operationId) {
        markdown += `  - Operation ID: \`${ep.operationId}\`\n`;
      }
      if (ep.tags && ep.tags.length > 0) {
        markdown += `  - Tags: ${ep.tags.join(', ')}\n`;
      }
      markdown += `\n`;
    });
  }
  
  // Removed endpoints
  if (diff.removed.length > 0) {
    markdown += `## Removed Endpoints\n\n`;
    diff.removed.forEach(ep => {
      markdown += `- **${ep.method}** \`${ep.path}\`\n`;
      if (ep.summary) {
        markdown += `  - Summary: ${ep.summary}\n`;
      }
      markdown += `\n`;
    });
  }
  
  // Changed endpoints
  if (diff.changed.length > 0) {
    markdown += `## Changed Endpoints\n\n`;
    diff.changed.forEach(change => {
      markdown += `- **${change.method}** \`${change.path}\`\n`;
      change.changes.forEach(changeDetail => {
        markdown += `  - ${changeDetail}\n`;
      });
      markdown += `\n`;
    });
  }
  
  if (diff.added.length === 0 && diff.removed.length === 0 && diff.changed.length === 0) {
    markdown += `## No Changes\n\n`;
    markdown += `No differences found between the current and previous OpenAPI specifications.\n`;
  }
  
  return markdown;
}

async function generateDiffReport(): Promise<void> {
  console.log('📊 Generating diff report...');
  
  const currentPath = path.join(__dirname, '../../docs/openapi/openapi.json');
  const previousPath = path.join(__dirname, '../../docs/openapi/artifacts/current.openapi.json');
  const outputPath = path.join(__dirname, '../../docs/openapi/artifacts/diff.md');
  
  if (!fs.existsSync(currentPath)) {
    throw new Error(`Current OpenAPI file not found: ${currentPath}`);
  }
  
  // Load current spec
  const currentSpec = JSON.parse(fs.readFileSync(currentPath, 'utf-8'));
  const currentEndpoints = extractEndpoints(currentSpec);
  
  // Load previous spec (if exists)
  let previousEndpoints: EndpointInfo[] = [];
  if (fs.existsSync(previousPath)) {
    try {
      const previousSpec = JSON.parse(fs.readFileSync(previousPath, 'utf-8'));
      previousEndpoints = extractEndpoints(previousSpec);
    } catch (error) {
      console.log('⚠️  Could not parse previous spec, treating as empty');
    }
  } else {
    console.log('ℹ️  No previous spec found, treating as empty');
  }
  
  // Generate diff
  const diff = compareEndpoints(previousEndpoints, currentEndpoints);
  
  // Generate markdown report
  const markdown = generateMarkdownReport(diff);
  
  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write report
  fs.writeFileSync(outputPath, markdown);
  console.log(`✅ Diff report saved to: ${outputPath}`);
  
  // Print summary to console
  console.log('\n📋 Diff Summary:');
  console.log(`  Added: ${diff.summary.totalAdded}`);
  console.log(`  Removed: ${diff.summary.totalRemoved}`);
  console.log(`  Changed: ${diff.summary.totalChanged}`);
  console.log(`  Total: ${diff.summary.totalEndpoints}`);
  
  if (diff.added.length > 0) {
    console.log('\n🆕 New endpoints:');
    diff.added.forEach(ep => {
      console.log(`  ${ep.method} ${ep.path}`);
    });
  }
}

if (require.main === module) {
  generateDiffReport().catch(console.error);
}

export { generateDiffReport };
