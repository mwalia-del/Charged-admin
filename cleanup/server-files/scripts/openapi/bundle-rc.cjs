#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function bundleRC() {
  console.log('🔧 Bundling RC release...');
  
  const artifactsDir = path.join(__dirname, '../../docs/openapi/artifacts');
  const rcDir = path.join(artifactsDir, 'rc');
  
  // Ensure RC directory exists
  if (!fs.existsSync(rcDir)) {
    fs.mkdirSync(rcDir, { recursive: true });
  }
  
  // Copy OpenAPI files to RC directory
  const sourceFiles = [
    'openapi.json',
    'openapi.merged.yaml'
  ];
  
  for (const file of sourceFiles) {
    const sourcePath = path.join(__dirname, '../../docs/openapi', file);
    const destPath = path.join(rcDir, file);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`  📋 Copied ${file}`);
    }
  }
  
  // Generate Redoc HTML
  const redocPath = path.join(rcDir, 'redoc.html');
  try {
    execSync(`npx redoc-cli build ${path.join(rcDir, 'openapi.json')} --output ${redocPath}`, {
      stdio: 'pipe'
    });
    console.log('  📋 Generated Redoc HTML');
  } catch (error) {
    console.log('  ⚠️  Redoc generation failed, using fallback');
    // Create a simple fallback
    const fallbackHtml = `<!DOCTYPE html>
<html>
<head>
    <title>Charged API Documentation</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
    <style>
        body { margin: 0; padding: 0; }
        #redoc-container { height: 100vh; }
    </style>
</head>
<body>
    <div id="redoc-container"></div>
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
    <script>
        Redoc.init('openapi.json', {}, document.getElementById('redoc-container'));
    </script>
</body>
</html>`;
    fs.writeFileSync(redocPath, fallbackHtml);
  }
  
  // Generate Swagger UI
  const swaggerUiDir = path.join(rcDir, 'swaggerui');
  if (!fs.existsSync(swaggerUiDir)) {
    fs.mkdirSync(swaggerUiDir, { recursive: true });
  }
  
  try {
    // Copy Swagger UI files
    const swaggerUiDist = path.join(__dirname, '../../node_modules/swagger-ui-dist');
    if (fs.existsSync(swaggerUiDist)) {
      const files = fs.readdirSync(swaggerUiDist);
      files.forEach(file => {
        const srcPath = path.join(swaggerUiDist, file);
        const destPath = path.join(swaggerUiDir, file);
        if (fs.statSync(srcPath).isFile()) {
          fs.copyFileSync(srcPath, destPath);
        }
      });
      
      // Update swagger-initializer.js
      const initializerPath = path.join(swaggerUiDir, 'swagger-initializer.js');
      const initializerContent = `window.onload = function() {
  window.ui = SwaggerUIBundle({
    url: './openapi.json',
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  });
};`;
      fs.writeFileSync(initializerPath, initializerContent);
      console.log('  📋 Generated Swagger UI');
    }
  } catch (error) {
    console.log('  ⚠️  Swagger UI generation failed');
  }
  
  // Create RC bundle zip
  const rcBundlePath = path.join(artifactsDir, 'rc_openapi_bundle.zip');
  try {
    execSync(`cd ${rcDir} && zip -r ${rcBundlePath} .`, { stdio: 'pipe' });
    console.log('  📦 Created RC bundle zip');
  } catch (error) {
    console.log('  ⚠️  Failed to create RC bundle zip');
  }
  
  // Create rollback bundle if current.openapi.json exists
  const currentSpecPath = path.join(artifactsDir, 'current.openapi.json');
  if (fs.existsSync(currentSpecPath)) {
    const rollbackPath = path.join(artifactsDir, 'rollback_previous_openapi.zip');
    try {
      execSync(`cd ${artifactsDir} && zip ${rollbackPath} current.openapi.json`, { stdio: 'pipe' });
      console.log('  📦 Created rollback bundle');
    } catch (error) {
      console.log('  ⚠️  Failed to create rollback bundle');
    }
  }
  
  console.log('✅ RC bundle created successfully');
}

if (require.main === module) {
  bundleRC();
}

module.exports = { bundleRC };
