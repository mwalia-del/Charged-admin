#!/usr/bin/env ts-node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

interface DiscoveredEndpoint {
  method: string;
  path: string;
  file: string;
  line: number;
  service: string;
  operationId?: string;
  summary?: string;
}

const SERVICES = [
  'auth', 'riders', 'drivers', 'businesses', 'rides', 
  'wallet', 'payments', 'tips', 'referrals', 'promotions',
  'scheduled', 'invoices', 'catalog', 'notifications', 'analytics'
];

async function scanCodeForEndpoints(): Promise<void> {
  console.log('🔍 Scanning codebase for API endpoints...');
  
  const discoveredEndpoints: DiscoveredEndpoint[] = [];
  const srcDir = path.join(__dirname, '../../src');
  
  // Search patterns for different frameworks
  const patterns = [
    '**/*.ts',
    '**/*.tsx',
    '**/*.js',
    '**/*.jsx'
  ];

  for (const pattern of patterns) {
    const files = await glob(pattern, { cwd: srcDir });
    
    for (const file of files) {
      const filePath = path.join(srcDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      
      // Look for Express routes
      const expressPatterns = [
        /app\.(get|post|put|patch|delete)\(['"`]([^'"`]+)['"`]/g,
        /router\.(get|post|put|patch|delete)\(['"`]([^'"`]+)['"`]/g,
        /\.(get|post|put|patch|delete)\(['"`]([^'"`]+)['"`]/g
      ];
      
      // Look for NestJS decorators
      const nestPatterns = [
        /@(Get|Post|Put|Patch|Delete)\(['"`]([^'"`]+)['"`]\)/g,
        /@Controller\(['"`]([^'"`]+)['"`]\)/g
      ];
      
      // Look for Fastify routes
      const fastifyPatterns = [
        /fastify\.(get|post|put|patch|delete)\(['"`]([^'"`]+)['"`]/g
      ];
      
      // Look for JSDoc route annotations
      const jsdocPatterns = [
        /@route\s+(GET|POST|PUT|PATCH|DELETE)\s+([^\s]+)/g,
        /@endpoint\s+(GET|POST|PUT|PATCH|DELETE)\s+([^\s]+)/g
      ];

      const allPatterns = [
        ...expressPatterns,
        ...nestPatterns,
        ...fastifyPatterns,
        ...jsdocPatterns
      ];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        for (const pattern of allPatterns) {
          let match;
          while ((match = pattern.exec(line)) !== null) {
            const method = match[1].toUpperCase();
            const routePath = match[2];
            
            // Determine service based on file path or route
            let service = 'unknown';
            for (const svc of SERVICES) {
              if (file.includes(svc) || routePath.includes(svc)) {
                service = svc;
                break;
              }
            }
            
            // Extract operation ID and summary from comments
            let operationId: string | undefined;
            let summary: string | undefined;
            
            // Look for JSDoc comments above the line
            for (let j = Math.max(0, i - 10); j < i; j++) {
              const commentLine = lines[j];
              if (commentLine.includes('@operationId')) {
                operationId = commentLine.match(/@operationId\s+(.+)/)?.[1]?.trim();
              }
              if (commentLine.includes('@summary')) {
                summary = commentLine.match(/@summary\s+(.+)/)?.[1]?.trim();
              }
            }
            
            discoveredEndpoints.push({
              method,
              path: routePath,
              file: file,
              line: i + 1,
              service,
              operationId,
              summary
            });
          }
        }
      }
    }
  }

  // Also scan existing artifacts for known endpoints
  const artifactsDir = path.join(__dirname, '../../artifacts');
  if (fs.existsSync(artifactsDir)) {
    const endpointsFile = path.join(artifactsDir, 'endpoints.json');
    if (fs.existsSync(endpointsFile)) {
      try {
        const existingEndpoints = JSON.parse(fs.readFileSync(endpointsFile, 'utf-8'));
        if (existingEndpoints.endpoints) {
          for (const endpoint of existingEndpoints.endpoints) {
            discoveredEndpoints.push({
              method: endpoint.method,
              path: endpoint.path,
              file: 'artifacts/endpoints.json',
              line: 0,
              service: endpoint.tag?.toLowerCase() || 'unknown',
              operationId: endpoint.operationId,
              summary: endpoint.summary
            });
          }
        }
      } catch (error) {
        console.log('⚠️  Could not parse existing endpoints.json');
      }
    }
  }

  // Save discovered endpoints
  const outputDir = path.join(__dirname, '../../docs/openapi/artifacts');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'discovered.json');
  fs.writeFileSync(outputPath, JSON.stringify(discoveredEndpoints, null, 2));
  
  console.log(`✅ Discovered ${discoveredEndpoints.length} endpoints`);
  console.log(`📁 Saved to: ${outputPath}`);
  
  // Print summary by service
  const byService = discoveredEndpoints.reduce((acc, endpoint) => {
    acc[endpoint.service] = (acc[endpoint.service] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('\n📊 Endpoints by service:');
  Object.entries(byService).forEach(([service, count]) => {
    console.log(`  ${service}: ${count}`);
  });
}

if (require.main === module) {
  scanCodeForEndpoints().catch(console.error);
}

export { scanCodeForEndpoints };
