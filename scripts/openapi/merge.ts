#!/usr/bin/env ts-node

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const { merge } = require('deepmerge');

interface OpenAPISpec {
  openapi: string;
  info: any;
  servers: any[];
  security: any[];
  tags: any[];
  paths: any;
  components: any;
  externalDocs?: any;
}

async function mergeOpenAPISpecs(): Promise<void> {
  console.log('🔀 Merging OpenAPI specifications...');
  
  const sourcesDir = path.join(__dirname, '../../docs/openapi/sources');
  const baseFile = path.join(__dirname, '../../docs/openapi/openapi.base.yaml');
  const commonFile = path.join(__dirname, '../../docs/openapi/common.yaml');
  
  // Load base specification
  if (!fs.existsSync(baseFile)) {
    throw new Error(`Base file not found: ${baseFile}`);
  }
  
  const baseContent = fs.readFileSync(baseFile, 'utf-8');
  const baseSpec: OpenAPISpec = yaml.parse(baseContent);
  
  // Load common components
  let commonComponents: any = {};
  if (fs.existsSync(commonFile)) {
    const commonContent = fs.readFileSync(commonFile, 'utf-8');
    const commonSpec = yaml.parse(commonContent);
    commonComponents = commonSpec.components || {};
  }
  
  // Initialize merged spec
  let mergedSpec: OpenAPISpec = {
    ...baseSpec,
    paths: {},
    components: {
      ...commonComponents
    }
  };
  
  // Load all service files
  const serviceFiles = fs.readdirSync(sourcesDir)
    .filter((file: string) => file.endsWith('.yaml') && file !== 'common.yaml')
    .sort();
  
  console.log(`📁 Found ${serviceFiles.length} service files`);
  
  for (const serviceFile of serviceFiles) {
    const servicePath = path.join(sourcesDir, serviceFile);
    const serviceContent = fs.readFileSync(servicePath, 'utf-8');
    const serviceSpec = yaml.parse(serviceContent);
    
    console.log(`  Processing ${serviceFile}...`);
    
    // Merge paths
    if (serviceSpec.paths) {
      mergedSpec.paths = { ...mergedSpec.paths, ...serviceSpec.paths };
    }
    
    // Merge components
    if (serviceSpec.components) {
      mergedSpec.components = merge(mergedSpec.components, serviceSpec.components);
    }
  }
  
  // Ensure output directory exists
  const outputDir = path.join(__dirname, '../../docs/openapi');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write merged YAML
  const mergedYamlPath = path.join(outputDir, 'openapi.merged.yaml');
  const yamlContent = yaml.stringify(mergedSpec, {
    indent: 2,
    lineWidth: 120,
    sortKeys: false
  });
  
  fs.writeFileSync(mergedYamlPath, yamlContent);
  console.log(`✅ Merged YAML saved to: ${mergedYamlPath}`);
  
  // Write JSON version
  const jsonPath = path.join(outputDir, 'openapi.json');
  fs.writeFileSync(jsonPath, JSON.stringify(mergedSpec, null, 2));
  console.log(`✅ Merged JSON saved to: ${jsonPath}`);
  
  // Print statistics
  const pathCount = Object.keys(mergedSpec.paths).length;
  const operationCount = Object.values(mergedSpec.paths).reduce((total: number, pathItem: any) => {
    return total + Object.keys(pathItem).filter(key => 
      ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(key)
    ).length;
  }, 0);
  
  const componentCount = Object.keys(mergedSpec.components || {}).length;
  const schemaCount = Object.keys(mergedSpec.components?.schemas || {}).length;
  
  console.log('\n📊 Merge Statistics:');
  console.log(`  Paths: ${pathCount}`);
  console.log(`  Operations: ${operationCount}`);
  console.log(`  Component categories: ${componentCount}`);
  console.log(`  Schemas: ${schemaCount}`);
  
  // Print operations by method
  const methodCounts: Record<string, number> = {};
  Object.values(mergedSpec.paths).forEach((pathItem: any) => {
    Object.keys(pathItem).forEach(method => {
      if (['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(method)) {
        methodCounts[method.toUpperCase()] = (methodCounts[method.toUpperCase()] || 0) + 1;
      }
    });
  });
  
  console.log('\n📈 Operations by method:');
  Object.entries(methodCounts)
    .sort(([,a], [,b]) => b - a)
    .forEach(([method, count]) => {
      console.log(`  ${method}: ${count}`);
    });
  
  // Print operations by tag
  const tagCounts: Record<string, number> = {};
  Object.values(mergedSpec.paths).forEach((pathItem: any) => {
    Object.values(pathItem).forEach((operation: any) => {
      if (operation.tags) {
        operation.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
  });
  
  console.log('\n🏷️  Operations by tag:');
  Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .forEach(([tag, count]) => {
      console.log(`  ${tag}: ${count}`);
    });
}

if (require.main === module) {
  mergeOpenAPISpecs().catch(console.error);
}

export { mergeOpenAPISpecs };
