#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';

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

interface ServerRoute {
  method: string;
  path: string;
  file: string;
  line: number;
  router: string;
  hasAuth: boolean;
  handler?: string;
}

interface OpenAPISpec {
  paths: Record<string, any>;
}

interface MismatchItem {
  admin: AdminUsage;
  openapi?: any;
  server?: ServerRoute;
  issues: string[];
}

interface DeprecatedItem {
  admin: AdminUsage;
  openapi: any;
  reason: string;
}

interface DiffResult {
  missing: AdminUsage[];
  mismatches: MismatchItem[];
  deprecated: DeprecatedItem[];
  summary: {
    totalAdminCalls: number;
    totalServerRoutes: number;
    totalOpenAPIPaths: number;
    missingCount: number;
    mismatchCount: number;
    deprecatedCount: number;
    coverage: number;
  };
}

class DiffAnalyzer {
  private outputDir: string;
  private adminUsage: AdminUsage[] = [];
  private serverRoutes: ServerRoute[] = [];
  private openapiSpec: OpenAPISpec = { paths: {} };

  constructor() {
    this.outputDir = 'artifacts/admin-sync';
  }

  private async loadData(): Promise<void> {
    console.log('📊 Loading analysis data...');

    // Load admin usage
    const adminUsagePath = path.join(this.outputDir, 'admin.usage.json');
    if (fs.existsSync(adminUsagePath)) {
      this.adminUsage = JSON.parse(fs.readFileSync(adminUsagePath, 'utf8'));
      console.log(`  📄 Admin usage: ${this.adminUsage.length} calls`);
    }

    // Load server routes
    const serverRoutesPath = path.join(this.outputDir, 'server.routes.json');
    if (fs.existsSync(serverRoutesPath)) {
      const serverData = JSON.parse(fs.readFileSync(serverRoutesPath, 'utf8'));
      this.serverRoutes = serverData.routes || [];
      console.log(`  📄 Server routes: ${this.serverRoutes.length} routes`);
    }

    // Load OpenAPI spec
    const openapiPath = path.join(this.outputDir, 'openapi.json');
    if (fs.existsSync(openapiPath)) {
      this.openapiSpec = JSON.parse(fs.readFileSync(openapiPath, 'utf8'));
      console.log(`  📄 OpenAPI paths: ${Object.keys(this.openapiSpec.paths || {}).length} paths`);
    }
  }

  private normalizePath(path: string): string {
    return path
      .replace(/:([A-Za-z0-9_]+)/g, '{$1}')
      .replace(/\$\{([A-Za-z0-9_]+)\}/g, '{$1}')
      .replace(/\/+/g, '/');
  }

  private findInOpenAPI(method: string, path: string): any {
    const normalizedPath = this.normalizePath(path);
    const openapiPath = this.openapiSpec.paths?.[normalizedPath];
    if (openapiPath && openapiPath[method.toLowerCase()]) {
      return openapiPath[method.toLowerCase()];
    }
    return null;
  }

  private findInServerRoutes(method: string, path: string): ServerRoute | null {
    const normalizedPath = this.normalizePath(path);
    return this.serverRoutes.find(route => 
      route.method === method && route.path === normalizedPath
    ) || null;
  }

  private analyzeMissing(): AdminUsage[] {
    const missing: AdminUsage[] = [];

    for (const adminCall of this.adminUsage) {
      const openapiMatch = this.findInOpenAPI(adminCall.method, adminCall.path);
      const serverMatch = this.findInServerRoutes(adminCall.method, adminCall.path);

      if (!openapiMatch && !serverMatch) {
        missing.push(adminCall);
      }
    }

    return missing;
  }

  private analyzeMismatches(): MismatchItem[] {
    const mismatches: MismatchItem[] = [];

    for (const adminCall of this.adminUsage) {
      const openapiMatch = this.findInOpenAPI(adminCall.method, adminCall.path);
      const serverMatch = this.findInServerRoutes(adminCall.method, adminCall.path);
      const issues: string[] = [];

      if (openapiMatch || serverMatch) {
        // Check for method mismatches
        if (openapiMatch && !openapiMatch[adminCall.method.toLowerCase()]) {
          issues.push(`Method ${adminCall.method} not found in OpenAPI`);
        }

        // Check for auth mismatches
        if (openapiMatch) {
          const requiresAuth = openapiMatch.security && openapiMatch.security.length > 0;
          if (requiresAuth && !adminCall.hasAuth) {
            issues.push('OpenAPI requires auth but admin call has no auth');
          }
          if (!requiresAuth && adminCall.hasAuth) {
            issues.push('Admin call has auth but OpenAPI does not require it');
          }
        }

        if (serverMatch) {
          if (serverMatch.hasAuth && !adminCall.hasAuth) {
            issues.push('Server route requires auth but admin call has no auth');
          }
          if (!serverMatch.hasAuth && adminCall.hasAuth) {
            issues.push('Admin call has auth but server route does not require it');
          }
        }

        // Check for body mismatches
        if (adminCall.hasBody && !['POST', 'PUT', 'PATCH'].includes(adminCall.method)) {
          issues.push('Admin call has body but method does not typically use body');
        }

        if (issues.length > 0) {
          mismatches.push({
            admin: adminCall,
            openapi: openapiMatch,
            server: serverMatch || undefined,
            issues
          });
        }
      }
    }

    return mismatches;
  }

  private analyzeDeprecated(): DeprecatedItem[] {
    const deprecated: DeprecatedItem[] = [];

    for (const adminCall of this.adminUsage) {
      const openapiMatch = this.findInOpenAPI(adminCall.method, adminCall.path);
      
      if (openapiMatch) {
        // Check for deprecated flag
        if (openapiMatch.deprecated === true) {
          deprecated.push({
            admin: adminCall,
            openapi: openapiMatch,
            reason: 'Marked as deprecated in OpenAPI'
          });
        }

        // Check for deprecation warnings in description
        if (openapiMatch.description && 
            (openapiMatch.description.toLowerCase().includes('deprecated') ||
             openapiMatch.description.toLowerCase().includes('deprecat'))) {
          deprecated.push({
            admin: adminCall,
            openapi: openapiMatch,
            reason: 'Description indicates deprecation'
          });
        }
      }
    }

    return deprecated;
  }

  private generateSummary(missing: AdminUsage[], mismatches: MismatchItem[], deprecated: DeprecatedItem[]): any {
    const totalAdminCalls = this.adminUsage.length;
    const totalServerRoutes = this.serverRoutes.length;
    const totalOpenAPIPaths = Object.keys(this.openapiSpec.paths || {}).length;
    const missingCount = missing.length;
    const mismatchCount = mismatches.length;
    const deprecatedCount = deprecated.length;
    const coverage = totalAdminCalls > 0 ? 
      ((totalAdminCalls - missingCount) / totalAdminCalls * 100) : 0;

    return {
      totalAdminCalls,
      totalServerRoutes,
      totalOpenAPIPaths,
      missingCount,
      mismatchCount,
      deprecatedCount,
      coverage: Math.round(coverage * 100) / 100
    };
  }

  private generateMarkdownSummary(result: DiffResult): string {
    const { summary, missing, mismatches, deprecated } = result;

    let md = `# Admin Dashboard Endpoint Analysis\n\n`;
    
    md += `## Overview\n`;
    md += `- **Total Admin API calls**: ${summary.totalAdminCalls}\n`;
    md += `- **Total Server routes**: ${summary.totalServerRoutes}\n`;
    md += `- **Total OpenAPI paths**: ${summary.totalOpenAPIPaths}\n`;
    md += `- **Missing endpoints**: ${summary.missingCount}\n`;
    md += `- **Mismatched endpoints**: ${summary.mismatchCount}\n`;
    md += `- **Deprecated endpoints**: ${summary.deprecatedCount}\n`;
    md += `- **Coverage**: ${summary.coverage}%\n\n`;

    if (missing.length > 0) {
      md += `## Missing Endpoints (${missing.length})\n\n`;
      md += `These admin calls are not found in either OpenAPI or server routes:\n\n`;
      missing.forEach((call, index) => {
        md += `${index + 1}. **${call.method} ${call.path}**\n`;
        md += `   - File: \`${call.file}:${call.line}\`\n`;
        md += `   - Page: ${call.page || 'unknown'}\n`;
        md += `   - Auth: ${call.hasAuth ? 'Yes' : 'No'}\n`;
        md += `   - Body: ${call.hasBody ? 'Yes' : 'No'}\n\n`;
      });
    }

    if (mismatches.length > 0) {
      md += `## Mismatched Endpoints (${mismatches.length})\n\n`;
      md += `These endpoints exist but have configuration mismatches:\n\n`;
      mismatches.forEach((mismatch: MismatchItem, index: number) => {
        md += `${index + 1}. **${mismatch.admin.method} ${mismatch.admin.path}**\n`;
        md += `   - File: \`${mismatch.admin.file}:${mismatch.admin.line}\`\n`;
        md += `   - Issues:\n`;
        mismatch.issues.forEach((issue: string) => {
          md += `     - ${issue}\n`;
        });
        md += `\n`;
      });
    }

    if (deprecated.length > 0) {
      md += `## Deprecated Endpoints (${deprecated.length})\n\n`;
      md += `These endpoints are marked as deprecated:\n\n`;
      deprecated.forEach((dep, index) => {
        md += `${index + 1}. **${dep.admin.method} ${dep.admin.path}**\n`;
        md += `   - File: \`${dep.admin.file}:${dep.admin.line}\`\n`;
        md += `   - Reason: ${dep.reason}\n\n`;
      });
    }

    return md;
  }

  async analyze(): Promise<void> {
    console.log('🚀 Analyzing Admin Dashboard endpoint coverage...');

    await this.loadData();

    const missing = this.analyzeMissing();
    const mismatches = this.analyzeMismatches();
    const deprecated = this.analyzeDeprecated();
    const summary = this.generateSummary(missing, mismatches, deprecated);

    const result: DiffResult = {
      missing,
      mismatches,
      deprecated,
      summary
    };

    // Write results
    const missingPath = path.join(this.outputDir, 'diff.missing.json');
    fs.writeFileSync(missingPath, JSON.stringify(missing, null, 2));

    const mismatchPath = path.join(this.outputDir, 'diff.mismatch.json');
    fs.writeFileSync(mismatchPath, JSON.stringify(mismatches, null, 2));

    const deprecatedPath = path.join(this.outputDir, 'diff.deprecated.json');
    fs.writeFileSync(deprecatedPath, JSON.stringify(deprecated, null, 2));

    const summaryPath = path.join(this.outputDir, 'SUMMARY.md');
    const summaryMarkdown = this.generateMarkdownSummary(result);
    fs.writeFileSync(summaryPath, summaryMarkdown);

    console.log(`📊 Analysis Results:`);
    console.log(`  Missing endpoints: ${missing.length}`);
    console.log(`  Mismatched endpoints: ${mismatches.length}`);
    console.log(`  Deprecated endpoints: ${deprecated.length}`);
    console.log(`  Coverage: ${summary.coverage}%`);
    console.log(`✅ Results saved to: ${this.outputDir}`);
  }
}

// Main execution
async function main() {
  try {
    const analyzer = new DiffAnalyzer();
    await analyzer.analyze();
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

export { DiffAnalyzer };
