#!/usr/bin/env ts-node

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

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

function generateOperationId(method: string, path: string): string {
  // Convert path to camelCase operation ID
  const pathParts = path
    .replace(/[{}]/g, '') // Remove path parameters
    .split('/')
    .filter(part => part && !part.startsWith('{'))
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());
  
  const methodPrefix = method.toLowerCase();
  return methodPrefix + pathParts.join('');
}

function generateSummary(method: string, path: string, service: string): string {
  const action = method === 'GET' ? 'Get' : 
                 method === 'POST' ? 'Create' :
                 method === 'PUT' ? 'Update' :
                 method === 'PATCH' ? 'Update' :
                 method === 'DELETE' ? 'Delete' : 'Process';
  
  const resource = path.split('/').pop()?.replace(/[{}]/g, '') || 'resource';
  return `${action} ${resource}`;
}

function createPathItem(endpoint: DiscoveredEndpoint): any {
  const operationId = endpoint.operationId || generateOperationId(endpoint.method, endpoint.path);
  const summary = endpoint.summary || generateSummary(endpoint.method, endpoint.path, endpoint.service);
  
  const pathItem: any = {
    [endpoint.method.toLowerCase()]: {
      tags: [endpoint.service.charAt(0).toUpperCase() + endpoint.service.slice(1)],
      summary,
      operationId,
      responses: {
        '200': {
          description: 'Success',
          content: {
            'application/json': {
              schema: {
                type: 'object'
              }
            }
          }
        },
        '400': {
          $ref: '#/components/responses/Error'
        },
        '401': {
          $ref: '#/components/responses/Unauthorized'
        },
        '404': {
          $ref: '#/components/responses/NotFound'
        },
        '422': {
          $ref: '#/components/responses/ValidationError'
        }
      }
    }
  };

  // Add security for non-public endpoints
  if (!endpoint.path.includes('/public/') && !endpoint.path.includes('/health')) {
    pathItem[endpoint.method.toLowerCase()].security = [{ bearerAuth: [] }];
  }

  // Add request body for POST, PUT, PATCH
  if (['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
    pathItem[endpoint.method.toLowerCase()].requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            description: 'TODO: Define request schema'
          }
        }
      }
    };
  }

  // Add path parameters
  const pathParams = endpoint.path.match(/\{([^}]+)\}/g);
  if (pathParams) {
    pathItem[endpoint.method.toLowerCase()].parameters = pathParams.map(param => ({
      name: param.slice(1, -1),
      in: 'path',
      required: true,
      schema: {
        type: 'string'
      }
    }));
  }

  return pathItem;
}

async function seedTemplates(): Promise<void> {
  console.log('🌱 Seeding templates for discovered endpoints...');
  
  // Load discovered endpoints
  const discoveredPath = path.join(__dirname, '../../docs/openapi/artifacts/discovered.json');
  if (!fs.existsSync(discoveredPath)) {
    console.log('❌ No discovered endpoints found. Run scan-code.ts first.');
    return;
  }

  const discoveredEndpoints: DiscoveredEndpoint[] = JSON.parse(
    fs.readFileSync(discoveredPath, 'utf-8')
  );

  // Group endpoints by service
  const endpointsByService = discoveredEndpoints.reduce((acc, endpoint) => {
    if (!acc[endpoint.service]) {
      acc[endpoint.service] = [];
    }
    acc[endpoint.service].push(endpoint);
    return acc;
  }, {} as Record<string, DiscoveredEndpoint[]>);

  let totalAdded = 0;

  for (const [service, endpoints] of Object.entries(endpointsByService)) {
    const serviceFile = path.join(__dirname, `../../docs/openapi/sources/${service}.yaml`);
    
    let existingPaths: any = {};
    if (fs.existsSync(serviceFile)) {
      try {
        const existingContent = fs.readFileSync(serviceFile, 'utf-8');
        const parsed = yaml.parse(existingContent);
        existingPaths = parsed.paths || {};
      } catch (error) {
        console.log(`⚠️  Could not parse existing ${service}.yaml: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    let addedCount = 0;
    const newPaths: any = { ...existingPaths };

    for (const endpoint of endpoints) {
      const pathKey = endpoint.path;
      
      // Skip if path already exists
      if (existingPaths[pathKey]) {
        continue;
      }

      // Create path item
      const pathItem = createPathItem(endpoint);
      newPaths[pathKey] = pathItem;
      addedCount++;
      totalAdded++;
    }

    if (addedCount > 0) {
      // Write updated service file
      const content = {
        paths: newPaths
      };

      const yamlContent = yaml.stringify(content, {
        indent: 2,
        lineWidth: 120
      });

      // Don't add TODO comments that break YAML syntax
      const yamlWithTodo = yamlContent;

      fs.writeFileSync(serviceFile, yamlWithTodo);
      console.log(`✅ Added ${addedCount} endpoints to ${service}.yaml`);
    } else {
      console.log(`ℹ️  No new endpoints to add to ${service}.yaml`);
    }
  }

  console.log(`\n🎉 Seeded ${totalAdded} new endpoint templates`);
  console.log('📝 Remember to update schemas and add proper request/response definitions');
}

if (require.main === module) {
  seedTemplates().catch(console.error);
}

export { seedTemplates };
