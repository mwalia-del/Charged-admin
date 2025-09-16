#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import pkg from 'fast-glob';
const { glob } = pkg;

interface ServerRoute {
  method: string;
  path: string;
  file: string;
  line: number;
  router: string;
  hasAuth: boolean;
  handler?: string;
}

interface ServerRoutes {
  routes: ServerRoute[];
  routers: Record<string, string[]>;
  mountPoints: Record<string, string>;
}

class ServerRouteScanner {
  private outputDir: string;

  constructor() {
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

  private extractMountPoints(appContent: string): Record<string, string> {
    const mountPoints: Record<string, string> = {};
    
    // Look for app.use patterns
    const patterns = [
      /app\.use\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      /app\.use\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(appContent)) !== null) {
        const mountPath = match[1];
        const routerName = match[2];
        mountPoints[routerName] = mountPath;
      }
    });

    return mountPoints;
  }

  private extractRoutesFromFile(filePath: string, mountPath: string = ''): ServerRoute[] {
    const routes: ServerRoute[] = [];
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      // Extract router name from file path
      const routerName = path.basename(filePath, path.extname(filePath));

      // Patterns to match Express routes
      const patterns = [
        // router.get('/path', handler)
        /router\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g,
        // app.get('/path', handler)
        /app\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g
      ];

      lines.forEach((line, index) => {
        patterns.forEach(pattern => {
          let match;
          while ((match = pattern.exec(line)) !== null) {
            const method = match[1].toUpperCase();
            let routePath = match[2];

            // Skip if it's not a route path
            if (!routePath.startsWith('/')) {
              return;
            }

            // Combine mount path with route path
            const fullPath = mountPath + routePath;
            const normalizedPath = this.normalizePath(fullPath);

            // Check for auth middleware in the same line or nearby lines
            const hasAuth = this.checkForAuth(line, lines, index);

            // Extract handler name if possible
            const handler = this.extractHandlerName(line);

            routes.push({
              method,
              path: normalizedPath,
              file: filePath,
              line: index + 1,
              router: routerName,
              hasAuth,
              handler
            });
          }
        });
      });
    } catch (error) {
      console.warn(`⚠️  Could not read ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    }

    return routes;
  }

  private checkForAuth(line: string, lines: string[], lineIndex: number): boolean {
    // Check current line
    if (line.includes('auth') || line.includes('Auth') || line.includes('loginAuth') || line.includes('checkAdmin')) {
      return true;
    }

    // Check nearby lines (within 3 lines)
    const start = Math.max(0, lineIndex - 3);
    const end = Math.min(lines.length, lineIndex + 4);
    
    for (let i = start; i < end; i++) {
      if (lines[i].includes('auth') || lines[i].includes('Auth') || lines[i].includes('loginAuth') || lines[i].includes('checkAdmin')) {
        return true;
      }
    }

    return false;
  }

  private extractHandlerName(line: string): string | undefined {
    // Try to extract handler function name
    const handlerPatterns = [
      /,\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\)/,
      /,\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*,\s*[a-zA-Z_$]/
    ];

    for (const pattern of handlerPatterns) {
      const match = line.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return undefined;
  }

  private async scanAppFiles(): Promise<Record<string, string>> {
    console.log('🔍 Scanning app files for mount points...');

    const appFiles = await glob([
      'app*.js',
      'app*.ts',
      'server*.js',
      'server*.ts',
      'index.js',
      'index.ts'
    ]);

    const mountPoints: Record<string, string> = {};

    for (const file of appFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const fileMountPoints = this.extractMountPoints(content);
        Object.assign(mountPoints, fileMountPoints);
        
        if (Object.keys(fileMountPoints).length > 0) {
          console.log(`  📄 ${file}: ${Object.keys(fileMountPoints).length} mount points`);
        }
      } catch (error) {
        console.warn(`⚠️  Could not read ${file}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return mountPoints;
  }

  private async scanRouteFiles(mountPoints: Record<string, string>): Promise<ServerRoute[]> {
    console.log('🔍 Scanning route files...');

    const routeFiles = await glob([
      'routes/**/*.js',
      'routes/**/*.ts',
      'src/routes/**/*.js',
      'src/routes/**/*.ts',
      '*routes*.js',
      '*routes*.ts'
    ]);

    const allRoutes: ServerRoute[] = [];

    for (const file of routeFiles) {
      try {
        // Try to find the mount path for this router
        const fileName = path.basename(file, path.extname(file));
        const mountPath = mountPoints[fileName] || '';

        const routes = this.extractRoutesFromFile(file, mountPath);
        allRoutes.push(...routes);

        if (routes.length > 0) {
          console.log(`  📄 ${file}: ${routes.length} routes`);
        }
      } catch (error) {
        console.warn(`⚠️  Could not read ${file}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return allRoutes;
  }

  private groupByRouter(routes: ServerRoute[]): Record<string, string[]> {
    const grouped: Record<string, string[]> = {};
    
    routes.forEach(route => {
      if (!grouped[route.router]) {
        grouped[route.router] = [];
      }
      grouped[route.router].push(`${route.method} ${route.path}`);
    });

    return grouped;
  }

  async scan(): Promise<void> {
    console.log('🚀 Scanning server routes...');

    await this.ensureOutputDir();

    const mountPoints = await this.scanAppFiles();
    const routes = await this.scanRouteFiles(mountPoints);
    const routers = this.groupByRouter(routes);

    const result: ServerRoutes = {
      routes,
      routers,
      mountPoints
    };

    // Write results
    const outputPath = path.join(this.outputDir, 'server.routes.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

    // Generate summary
    const summary = this.generateSummary(result);
    const summaryPath = path.join(this.outputDir, 'server.routes.summary.md');
    fs.writeFileSync(summaryPath, summary);

    console.log(`📊 Server Routes Stats:`);
    console.log(`  Total routes: ${routes.length}`);
    console.log(`  Unique endpoints: ${new Set(routes.map(r => `${r.method} ${r.path}`)).size}`);
    console.log(`  Routers: ${Object.keys(routers).length}`);
    console.log(`  Mount points: ${Object.keys(mountPoints).length}`);
    console.log(`  Authenticated routes: ${routes.filter(r => r.hasAuth).length}`);
    console.log(`✅ Results saved to: ${outputPath}`);
    console.log(`📋 Summary: ${summaryPath}`);
  }

  private generateSummary(result: ServerRoutes): string {
    const { routes, routers, mountPoints } = result;

    const methodCounts = routes.reduce((acc, route) => {
      acc[route.method] = (acc[route.method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const uniqueEndpoints = new Set(routes.map(r => `${r.method} ${r.path}`));
    const authRoutes = routes.filter(r => r.hasAuth).length;

    let summary = `# Server Routes Summary\n\n`;
    summary += `## Overview\n`;
    summary += `- **Total routes**: ${routes.length}\n`;
    summary += `- **Unique endpoints**: ${uniqueEndpoints.size}\n`;
    summary += `- **Routers**: ${Object.keys(routers).length}\n`;
    summary += `- **Mount points**: ${Object.keys(mountPoints).length}\n`;
    summary += `- **Authenticated routes**: ${authRoutes}\n\n`;

    summary += `## Mount Points\n`;
    Object.entries(mountPoints).forEach(([router, path]) => {
      summary += `- **${router}**: ${path}\n`;
    });

    summary += `\n## By Method\n`;
    Object.entries(methodCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([method, count]) => {
        summary += `- **${method}**: ${count}\n`;
      });

    summary += `\n## By Router\n`;
    Object.entries(routers)
      .sort(([,a], [,b]) => b.length - a.length)
      .forEach(([router, routerRoutes]) => {
        summary += `- **${router}**: ${routerRoutes.length} routes\n`;
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
    const scanner = new ServerRouteScanner();
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

export { ServerRouteScanner };
