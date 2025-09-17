#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

function addStandardResponses() {
  console.log('🔧 Adding standard responses...');
  
  const mergedYamlPath = path.join(__dirname, '../../docs/openapi/openapi.merged.yaml');
  
  if (!fs.existsSync(mergedYamlPath)) {
    console.error('❌ openapi.merged.yaml not found');
    process.exit(1);
  }
  
  const content = fs.readFileSync(mergedYamlPath, 'utf8');
  const spec = yaml.parse(content);
  
  // Ensure components structure exists
  if (!spec.components) {
    spec.components = {};
  }
  if (!spec.components.responses) {
    spec.components.responses = {};
  }
  if (!spec.components.schemas) {
    spec.components.schemas = {};
  }
  
  // Add Error schema if missing
  if (!spec.components.schemas.Error) {
    spec.components.schemas.Error = {
      type: 'object',
      required: ['code', 'message'],
      properties: {
        code: {
          type: 'string',
          description: 'Error code'
        },
        message: {
          type: 'string',
          description: 'Error message'
        }
      }
    };
    console.log('  ➕ Added Error schema');
  }
  
  // Define standard responses
  const standardResponses = {
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
    Forbidden: {
      description: 'Forbidden',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error'
          }
        }
      }
    },
    NotFound: {
      description: 'Not Found',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error'
          }
        }
      }
    },
    Unprocessable: {
      description: 'Unprocessable Entity',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error'
          }
        }
      }
    },
    ServerError: {
      description: 'Internal Server Error',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error'
          }
        }
      }
    }
  };
  
  // Add standard responses to components
  for (const [name, response] of Object.entries(standardResponses)) {
    if (!spec.components.responses[name]) {
      spec.components.responses[name] = response;
      console.log(`  ➕ Added ${name} response`);
    }
  }
  
  // Remove duplicate ValidationError if it exists
  if (spec.components.responses.ValidationError && spec.components.responses.ValidationError.allOf) {
    // Keep the simpler one
    spec.components.responses.ValidationError = {
      description: 'Validation error',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error'
          }
        }
      }
    };
    console.log('  🔄 Fixed duplicate ValidationError response');
  }
  
  // Add standard responses to all operations
  const requiredResponses = [
    { status: '400', ref: 'BadRequest' },
    { status: '401', ref: 'Unauthorized' },
    { status: '403', ref: 'Forbidden' },
    { status: '404', ref: 'NotFound' },
    { status: '422', ref: 'Unprocessable' },
    { status: '500', ref: 'ServerError' }
  ];
  
  let addedResponses = 0;
  
  for (const [pathKey, pathItem] of Object.entries(spec.paths || {})) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (typeof operation === 'object' && operation.operationId) {
        if (!operation.responses) {
          operation.responses = {};
        }
        
        for (const { status, ref } of requiredResponses) {
          if (!operation.responses[status]) {
            operation.responses[status] = {
              $ref: `#/components/responses/${ref}`
            };
            addedResponses++;
          }
        }
      }
    }
  }
  
  // Write back to file
  const yamlContent = yaml.stringify(spec, {
    indent: 2,
    lineWidth: 120
  });
  
  fs.writeFileSync(mergedYamlPath, yamlContent);
  
  console.log(`✅ Added ${addedResponses} standard responses`);
}

if (require.main === module) {
  addStandardResponses();
}

module.exports = { addStandardResponses };
