#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

function deepEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return false;
  if (typeof obj1 !== typeof obj2) return false;
  
  if (typeof obj1 === 'object') {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) return false;
    
    for (const key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!deepEqual(obj1[key], obj2[key])) return false;
    }
    
    return true;
  }
  
  return obj1 === obj2;
}

function dedupeSchemas() {
  console.log('🔧 Deduplicating schemas...');
  
  const mergedYamlPath = path.join(__dirname, '../../docs/openapi/openapi.merged.yaml');
  
  if (!fs.existsSync(mergedYamlPath)) {
    console.error('❌ openapi.merged.yaml not found');
    process.exit(1);
  }
  
  const content = fs.readFileSync(mergedYamlPath, 'utf8');
  const spec = yaml.parse(content);
  
  if (!spec.components || !spec.components.schemas) {
    console.log('  ℹ️  No schemas to dedupe');
    return;
  }
  
  const schemas = spec.components.schemas;
  const schemaMap = new Map();
  const duplicates = new Map();
  let renamedCount = 0;
  
  // First pass: identify duplicates
  for (const [name, schema] of Object.entries(schemas)) {
    const schemaKey = JSON.stringify(schema);
    if (schemaMap.has(schemaKey)) {
      const originalName = schemaMap.get(schemaKey);
      if (!duplicates.has(originalName)) {
        duplicates.set(originalName, []);
      }
      duplicates.get(originalName).push(name);
    } else {
      schemaMap.set(schemaKey, name);
    }
  }
  
  // Second pass: rename duplicates and update references
  for (const [originalName, duplicateNames] of duplicates) {
    for (const duplicateName of duplicateNames) {
      // Generate new name with service suffix
      const serviceSuffix = duplicateName.includes('_') ? duplicateName.split('_')[1] : 'Core';
      const newName = `${originalName}_${serviceSuffix}`;
      
      // Rename the schema
      schemas[newName] = schemas[duplicateName];
      delete schemas[duplicateName];
      renamedCount++;
      
      console.log(`  🔄 Renamed ${duplicateName} → ${newName}`);
      
      // Update all references to this schema
      updateSchemaReferences(spec, duplicateName, newName);
    }
  }
  
  // Write back to file
  const yamlContent = yaml.stringify(spec, {
    indent: 2,
    lineWidth: 120
  });
  
  fs.writeFileSync(mergedYamlPath, yamlContent);
  
  console.log(`✅ Deduplicated schemas: ${renamedCount} renamed`);
}

function updateSchemaReferences(obj, oldName, newName) {
  if (typeof obj === 'object' && obj !== null) {
    if (Array.isArray(obj)) {
      for (const item of obj) {
        updateSchemaReferences(item, oldName, newName);
      }
    } else {
      for (const [key, value] of Object.entries(obj)) {
        if (key === '$ref' && typeof value === 'string' && value.includes(`#/components/schemas/${oldName}`)) {
          obj[key] = value.replace(`#/components/schemas/${oldName}`, `#/components/schemas/${newName}`);
        } else {
          updateSchemaReferences(value, oldName, newName);
        }
      }
    }
  }
}

if (require.main === module) {
  dedupeSchemas();
}

module.exports = { dedupeSchemas };
