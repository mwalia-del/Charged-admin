#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import pkg from 'fast-glob';
const { glob } = pkg;

interface AdminUsage {
  method: string;
  path: string;
  file: string;
  line: number;
  hasBody: boolean;
  hasAuth: boolean;
  page?: string;
  context?: string;
}

interface AdminUsageByPage {
  [page: string]: AdminUsage[];
}

class AdminUsageScanner {
  private srcDir: string;
  private outputDir: string;

  constructor() {
    this.srcDir = 'src';
    this.outputDir = 'artifacts/admin-sync';
  }

  private async ensureOutputDir(): Promise<void> {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  private normalizePath(path: string): string {
    // Convert Express-style params to OpenAPI style
    return path
      .replace(/:([A-Za-z0-9_]+)/g, '{$1}')
      .replace(/\$\{([A-Za-z0-9_]+)\}/g, '{$1}')
      .replace(/\/+/g, '/'); // Remove duplicate slashes
  }

  private extractApiCalls(content: string, filePath: string): AdminUsage[] {
    const calls: AdminUsage[] = [];
    const lines = content.split('\n');

    // Patterns to match API calls
    const patterns = [
      // axios.get('/path')
      /axios\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g,
      // api.get('/path')
      /api\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g,
      // instance.get('/path')
      /instance\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g,
      // fetch('/path')
      /fetch\s*\(\s*['"`]([^'"`]+)['"`]/g,
      // axios({ method: 'GET', url: '/path' })
      /axios\s*\(\s*\{[^}]*method:\s*['"`]([^'"`]+)['"`][^}]*url:\s*['"`]([^'"`]+)['"`]/g,
      // axios({ url: '/path', method: 'GET' })
      /axios\s*\(\s*\{[^}]*url:\s*['"`]([^'"`]+)['"`][^}]*method:\s*['"`]([^'"`]+)['"`]/g
    ];

    lines.forEach((line, index) => {
      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          let method: string;
          let apiPath: string;

          if (match.length === 3) {
            // Standard patterns: method, path
            method = match[1].toUpperCase();
            apiPath = match[2];
          } else if (match.length === 4) {
            // axios({ method: 'GET', url: '/path' }) pattern
            method = match[1].toUpperCase();
            apiPath = match[2];
          } else {
            // fetch pattern (assume GET)
            method = 'GET';
            apiPath = match[1];
          }

          // Skip if it's not an API path (no leading slash or contains http)
          if (!apiPath.startsWith('/') || apiPath.startsWith('http')) {
            return;
          }

          // Skip common non-API paths
          if (apiPath.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
            return;
          }

          const normalizedPath = this.normalizePath(apiPath);
          
          // Determine if it has body (POST, PUT, PATCH)
          const hasBody = ['POST', 'PUT', 'PATCH'].includes(method);
          
          // Check for auth headers or token usage
          const hasAuth = line.includes('Authorization') || 
                         line.includes('Bearer') || 
                         line.includes('token') ||
                         line.includes('auth');

          // Determine page context from file path
          const page = this.extractPageContext(filePath);

          calls.push({
            method,
            path: normalizedPath,
            file: filePath,
            line: index + 1,
            hasBody,
            hasAuth,
            page,
            context: line.trim()
          });
        }
      });
    });

    return calls;
  }

  private extractPageContext(filePath: string): string {
    // Extract page name from file path
    const pathParts = filePath.split('/');
    
    // Look for pages directory
    const pagesIndex = pathParts.indexOf('pages');
    if (pagesIndex !== -1 && pagesIndex + 1 < pathParts.length) {
      return pathParts[pagesIndex + 1];
    }

    // Look for components directory
    const componentsIndex = pathParts.indexOf('components');
    if (componentsIndex !== -1 && componentsIndex + 1 < pathParts.length) {
      return `components/${pathParts[componentsIndex + 1]}`;
    }

    // Look for API directory
    const apiIndex = pathParts.indexOf('API');
    if (apiIndex !== -1 && apiIndex + 1 < pathParts.length) {
      return `api/${pathParts[apiIndex + 1]}`;
    }

    return 'unknown';
  }

  private async scanFiles(): Promise<AdminUsage[]> {
    console.log('🔍 Scanning Admin Dashboard for API usage...');

    // Find all TypeScript and JavaScript files in src
    const files = await glob([
      'src/**/*.{ts,tsx,js,jsx}',
      '!src/**/*.d.ts',
      '!src/**/*.test.*',
      '!src/**/*.spec.*'
    ]);

    console.log(`📁 Found ${files.length} files to scan`);

    const allCalls: AdminUsage[] = [];

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const calls = this.extractApiCalls(content, file);
        allCalls.push(...calls);
        
        if (calls.length > 0) {
          console.log(`  📄 ${file}: ${calls.length} API calls`);
        }
      } catch (error) {
        console.warn(`⚠️  Could not read ${file}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return allCalls;
  }

  private groupByPage(calls: AdminUsage[]): AdminUsageByPage {
    const grouped: AdminUsageByPage = {};
    
    calls.forEach(call => {
      if (!grouped[call.page || 'unknown']) {
        grouped[call.page || 'unknown'] = [];
      }
      grouped[call.page || 'unknown'].push(call);
    });

    return grouped;
  }

  async scan(): Promise<void> {
    console.log('🚀 Scanning Admin Dashboard API usage...');

    await this.ensureOutputDir();

    const calls = await this.scanFiles();
    const grouped = this.groupByPage(calls);

    // Write detailed results
    const outputPath = path.join(this.outputDir, 'admin.usage.json');
    fs.writeFileSync(outputPath, JSON.stringify(calls, null, 2));

    // Write by-page index
    const pageIndexPath = path.join(this.outputDir, 'admin.usage.by-page.json');
    fs.writeFileSync(pageIndexPath, JSON.stringify(grouped, null, 2));

    // Generate summary
    const summary = this.generateSummary(calls, grouped);
    const summaryPath = path.join(this.outputDir, 'admin.usage.summary.md');
    fs.writeFileSync(summaryPath, summary);

    console.log(`📊 Admin Usage Stats:`);
    console.log(`  Total API calls: ${calls.length}`);
    console.log(`  Unique endpoints: ${new Set(calls.map(c => `${c.method} ${c.path}`)).size}`);
    console.log(`  Pages with API calls: ${Object.keys(grouped).length}`);
    console.log(`  Files with API calls: ${new Set(calls.map(c => c.file)).size}`);
    console.log(`✅ Results saved to: ${outputPath}`);
    console.log(`📄 Page index: ${pageIndexPath}`);
    console.log(`📋 Summary: ${summaryPath}`);
  }

  private generateSummary(calls: AdminUsage[], grouped: AdminUsageByPage): string {
    const methodCounts = calls.reduce((acc, call) => {
      acc[call.method] = (acc[call.method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const uniqueEndpoints = new Set(calls.map(c => `${c.method} ${c.path}`));
    const authCalls = calls.filter(c => c.hasAuth).length;
    const bodyCalls = calls.filter(c => c.hasBody).length;

    let summary = `# Admin Dashboard API Usage Summary\n\n`;
    summary += `## Overview\n`;
    summary += `- **Total API calls**: ${calls.length}\n`;
    summary += `- **Unique endpoints**: ${uniqueEndpoints.size}\n`;
    summary += `- **Pages with API calls**: ${Object.keys(grouped).length}\n`;
    summary += `- **Files with API calls**: ${new Set(calls.map(c => c.file)).size}\n`;
    summary += `- **Authenticated calls**: ${authCalls}\n`;
    summary += `- **Calls with body**: ${bodyCalls}\n\n`;

    summary += `## By Method\n`;
    Object.entries(methodCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([method, count]) => {
        summary += `- **${method}**: ${count}\n`;
      });

    summary += `\n## By Page\n`;
    Object.entries(grouped)
      .sort(([,a], [,b]) => b.length - a.length)
      .forEach(([page, pageCalls]) => {
        summary += `- **${page}**: ${pageCalls.length} calls\n`;
      });

    summary += `\n## All Endpoints\n`;
    Array.from(uniqueEndpoints)
      .sort()
      .forEach(endpoint => {
        summary += `- ${endpoint}\n`;
      });

    return summary;
  }
}

// Main execution
async function main() {
  try {
    const scanner = new AdminUsageScanner();
    await scanner.scan();
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { AdminUsageScanner };
