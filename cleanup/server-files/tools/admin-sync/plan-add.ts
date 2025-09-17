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

interface PlanItem {
  method: string;
  path: string;
  router: string;
  handler: string;
  auth: boolean;
  body: boolean;
  openapiPath: string;
  openapiOperation: any;
}

class PlanGenerator {
  private outputDir: string;
  private missingEndpoints: AdminUsage[] = [];

  constructor() {
    this.outputDir = 'artifacts/admin-sync';
  }

  private async loadMissingEndpoints(): Promise<void> {
    const missingPath = path.join(this.outputDir, 'diff.missing.json');
    if (fs.existsSync(missingPath)) {
      this.missingEndpoints = JSON.parse(fs.readFileSync(missingPath, 'utf8'));
      console.log(`📄 Loaded ${this.missingEndpoints.length} missing endpoints`);
    }
  }

  private determineRouter(endpoint: AdminUsage): string {
    const path = endpoint.path;
    
    if (path.startsWith('/admin/')) {
      return 'admin';
    } else if (path.startsWith('/ride/')) {
      return 'ride';
    } else if (path.startsWith('/driver/')) {
      return 'driver';
    } else if (path.startsWith('/payment/')) {
      return 'payment';
    } else if (path.startsWith('/catalog/')) {
      return 'catalog';
    } else if (path.startsWith('/businesses/')) {
      return 'business';
    } else if (path.startsWith('/analytics/')) {
      return 'analytics';
    } else if (path.startsWith('/referrals/')) {
      return 'referrals';
    } else if (path.startsWith('/promotions/')) {
      return 'promotions';
    } else if (path.startsWith('/scheduled-rides/')) {
      return 'scheduled';
    } else if (path.startsWith('/tips/')) {
      return 'tips';
    } else if (path.startsWith('/invoices/')) {
      return 'invoices';
    } else if (path.startsWith('/rewards/')) {
      return 'rewards';
    } else {
      return 'admin'; // Default to admin for unknown paths
    }
  }

  private generateHandlerName(endpoint: AdminUsage): string {
    const pathParts = endpoint.path.split('/').filter(Boolean);
    const method = endpoint.method.toLowerCase();
    
    // Remove common prefixes
    let cleanPath = pathParts.join('_');
    if (cleanPath.startsWith('admin_')) {
      cleanPath = cleanPath.substring(6);
    }
    
    // Convert to camelCase
    const camelCase = cleanPath
      .split('_')
      .map((part, index) => 
        index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
      )
      .join('');
    
    return `${method}${camelCase.charAt(0).toUpperCase()}${camelCase.slice(1)}`;
  }

  private generateExpressHandler(endpoint: AdminUsage, router: string): string {
    const handlerName = this.generateHandlerName(endpoint);
    const authMiddleware = endpoint.hasAuth ? 'checkAdmin, ' : '';
    
    return `router.${endpoint.method.toLowerCase()}('${endpoint.path}', ${authMiddleware}${handlerName});`;
  }

  private generateHandlerImplementation(endpoint: AdminUsage): string {
    const handlerName = this.generateHandlerName(endpoint);
    const hasBody = endpoint.hasBody;
    const hasAuth = endpoint.hasAuth;
    
    let handler = `const ${handlerName} = async (req, res) => {\n`;
    handler += `  try {\n`;
    handler += `    // TODO: Implement ${endpoint.method} ${endpoint.path}\n`;
    
    if (hasBody) {
      handler += `    const body = req.body;\n`;
    }
    
    if (hasAuth) {
      handler += `    const userId = req.user?.id;\n`;
    }
    
    // Extract path parameters
    const pathParams = endpoint.path.match(/\{([^}]+)\}/g);
    if (pathParams) {
      pathParams.forEach(param => {
        const paramName = param.slice(1, -1);
        handler += `    const ${paramName} = req.params.${paramName};\n`;
      });
    }
    
    handler += `    \n`;
    handler += `    // Placeholder response\n`;
    handler += `    res.status(200).json({\n`;
    handler += `      success: true,\n`;
    handler += `      message: '${endpoint.method} ${endpoint.path} endpoint implemented',\n`;
    handler += `      data: {}\n`;
    handler += `    });\n`;
    handler += `  } catch (error) {\n`;
    handler += `    console.error('Error in ${handlerName}:', error);\n`;
    handler += `    res.status(500).json({\n`;
    handler += `      success: false,\n`;
    handler += `      message: 'Internal server error'\n`;
    handler += `    });\n`;
    handler += `  }\n`;
    handler += `};\n`;
    
    return handler;
  }

  private generateOpenAPIPath(endpoint: AdminUsage): any {
    const operationId = this.generateHandlerName(endpoint);
    const summary = `${endpoint.method} ${endpoint.path}`;
    const tags = [this.determineRouter(endpoint)];
    
    const operation: any = {
      tags,
      summary,
      operationId,
      responses: {
        '200': {
          description: 'Success',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  data: { type: 'object' }
                }
              }
            }
          }
        },
        '400': { $ref: '#/components/responses/BadRequest' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '500': { $ref: '#/components/responses/ServerError' }
      }
    };

    if (endpoint.hasAuth) {
      operation.security = [{ bearerAuth: [] }];
    }

    if (endpoint.hasBody) {
      operation.requestBody = {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              description: 'Request body'
            }
          }
        }
      };
    }

    // Add path parameters
    const pathParams = endpoint.path.match(/\{([^}]+)\}/g);
    if (pathParams) {
      operation.parameters = pathParams.map(param => {
        const paramName = param.slice(1, -1);
        return {
          name: paramName,
          in: 'path',
          required: true,
          schema: { type: 'string' }
        };
      });
    }

    return operation;
  }

  private generatePatchFile(): string {
    let patch = `--- a/routes/admin.js\n`;
    patch += `+++ b/routes/admin.js\n`;
    patch += `@@ -1,3 +1,3 @@\n`;
    patch += ` const express = require('express');\n`;
    patch += ` const router = express.Router();\n`;
    patch += `+// Generated admin endpoints\n`;
    patch += ` \n`;
    
    // Group by router
    const byRouter: Record<string, AdminUsage[]> = {};
    this.missingEndpoints.forEach(endpoint => {
      const router = this.determineRouter(endpoint);
      if (!byRouter[router]) {
        byRouter[router] = [];
      }
      byRouter[router].push(endpoint);
    });

    // Generate handlers for each router
    Object.entries(byRouter).forEach(([router, endpoints]) => {
      patch += `\n// ${router} endpoints\n`;
      endpoints.forEach(endpoint => {
        patch += `${this.generateExpressHandler(endpoint, router)}\n`;
        patch += `${this.generateHandlerImplementation(endpoint)}\n`;
      });
    });

    patch += `\n module.exports = router;\n`;
    
    return patch;
  }

  private generateOpenAPISpec(): any {
    const paths: Record<string, any> = {};
    
    this.missingEndpoints.forEach(endpoint => {
      const method = endpoint.method.toLowerCase();
      if (!paths[endpoint.path]) {
        paths[endpoint.path] = {};
      }
      paths[endpoint.path][method] = this.generateOpenAPIPath(endpoint);
    });

    return {
      paths,
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        },
        responses: {
          BadRequest: {
            description: 'Bad Request',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          Unauthorized: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          ServerError: {
            description: 'Server Error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        },
        schemas: {
          Error: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' }
            }
          }
        }
      }
    };
  }

  private generateChecklist(): string {
    let checklist = `# Admin Endpoint Implementation Checklist\n\n`;
    checklist += `## Overview\n`;
    checklist += `- **Total missing endpoints**: ${this.missingEndpoints.length}\n`;
    checklist += `- **Routers affected**: ${new Set(this.missingEndpoints.map(e => this.determineRouter(e))).size}\n\n`;

    // Group by router
    const byRouter: Record<string, AdminUsage[]> = {};
    this.missingEndpoints.forEach(endpoint => {
      const router = this.determineRouter(endpoint);
      if (!byRouter[router]) {
        byRouter[router] = [];
      }
      byRouter[router].push(endpoint);
    });

    Object.entries(byRouter).forEach(([router, endpoints]) => {
      checklist += `## ${router.toUpperCase()} Router (${endpoints.length} endpoints)\n\n`;
      endpoints.forEach((endpoint, index) => {
        checklist += `### ${index + 1}. ${endpoint.method} ${endpoint.path}\n`;
        checklist += `- [ ] Add route to \`routes/${router}.js\`\n`;
        checklist += `- [ ] Implement handler function\n`;
        checklist += `- [ ] Add authentication middleware (if needed)\n`;
        checklist += `- [ ] Add request validation\n`;
        checklist += `- [ ] Add response formatting\n`;
        checklist += `- [ ] Add error handling\n`;
        checklist += `- [ ] Add to OpenAPI spec\n`;
        checklist += `- [ ] Test endpoint\n`;
        checklist += `- [ ] Update documentation\n\n`;
      });
    });

    return checklist;
  }

  async generate(): Promise<void> {
    console.log('🚀 Generating plan to add missing endpoints...');

    await this.loadMissingEndpoints();

    if (this.missingEndpoints.length === 0) {
      console.log('✅ No missing endpoints to add!');
      return;
    }

    // Generate patch file
    const patchContent = this.generatePatchFile();
    const patchPath = path.join(this.outputDir, 'plan.to_add.patch');
    fs.writeFileSync(patchPath, patchContent);

    // Generate OpenAPI spec
    const openapiSpec = this.generateOpenAPISpec();
    const specPath = path.join(this.outputDir, 'plan.to_add.spec.yaml');
    fs.writeFileSync(specPath, JSON.stringify(openapiSpec, null, 2));

    // Generate checklist
    const checklist = this.generateChecklist();
    const checklistPath = path.join(this.outputDir, 'plan.checklist.md');
    fs.writeFileSync(checklistPath, checklist);

    console.log(`📊 Plan Generation Results:`);
    console.log(`  Missing endpoints: ${this.missingEndpoints.length}`);
    console.log(`  Routers affected: ${new Set(this.missingEndpoints.map(e => this.determineRouter(e))).size}`);
    console.log(`  Patch file: ${patchPath}`);
    console.log(`  OpenAPI spec: ${specPath}`);
    console.log(`  Checklist: ${checklistPath}`);
    console.log(`✅ Plan generated successfully!`);
  }
}

// Main execution
async function main() {
  try {
    const generator = new PlanGenerator();
    await generator.generate();
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

export { PlanGenerator };
