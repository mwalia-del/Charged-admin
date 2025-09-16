#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import yaml from 'yaml';

const yamlFile = 'docs/openapi/openapi.merged.yaml';
const jsonFile = 'artifacts/admin-sync/openapi.json';

try {
  console.log('Converting YAML to JSON...');
  const yamlContent = fs.readFileSync(yamlFile, 'utf8');
  const jsonContent = yaml.parse(yamlContent);
  fs.writeFileSync(jsonFile, JSON.stringify(jsonContent, null, 2));
  console.log(`✅ Converted ${yamlFile} to ${jsonFile}`);
} catch (error) {
  console.error(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
