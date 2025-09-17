#!/usr/bin/env ts-node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function bundleDocumentation(): Promise<void> {
  console.log('📦 Bundling documentation...');
  
  const openapiJsonPath = path.join(__dirname, '../../docs/openapi/openapi.json');
  const artifactsDir = path.join(__dirname, '../../docs/openapi/artifacts');
  
  if (!fs.existsSync(openapiJsonPath)) {
    throw new Error(`OpenAPI JSON file not found: ${openapiJsonPath}`);
  }
  
  // Ensure artifacts directory exists
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }
  
  // Copy OpenAPI JSON to artifacts
  const artifactsJsonPath = path.join(artifactsDir, 'openapi.json');
  fs.copyFileSync(openapiJsonPath, artifactsJsonPath);
  console.log(`✅ Copied OpenAPI JSON to: ${artifactsJsonPath}`);
  
  // Generate Redoc HTML
  console.log('📄 Generating Redoc HTML...');
  try {
    const redocPath = path.join(artifactsDir, 'redoc.html');
    execSync(`npx redoc-cli build ${openapiJsonPath} --output ${redocPath}`, {
      stdio: 'pipe'
    });
    console.log(`✅ Redoc HTML generated: ${redocPath}`);
  } catch (error) {
    console.log('⚠️  Redoc generation failed, trying alternative method...');
    // Fallback: create a simple HTML file that loads Redoc
    const redocHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Charged API Documentation</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
  <style>
    body { margin: 0; padding: 0; }
  </style>
</head>
<body>
  <redoc spec-url="./openapi.json"></redoc>
  <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
</body>
</html>`;
    
    const redocPath = path.join(artifactsDir, 'redoc.html');
    fs.writeFileSync(redocPath, redocHtml);
    console.log(`✅ Redoc HTML created: ${redocPath}`);
  }
  
  // Generate Swagger UI bundle
  console.log('🌐 Generating Swagger UI bundle...');
  const swaggerUiDir = path.join(artifactsDir, 'swaggerui');
  
  if (!fs.existsSync(swaggerUiDir)) {
    fs.mkdirSync(swaggerUiDir, { recursive: true });
  }
  
  // Copy Swagger UI files
  try {
    const swaggerUiDist = path.join(__dirname, '../../node_modules/swagger-ui-dist');
    if (fs.existsSync(swaggerUiDist)) {
      // Copy all Swagger UI files
      const files = fs.readdirSync(swaggerUiDist);
      files.forEach((file: string) => {
        const srcPath = path.join(swaggerUiDist, file);
        const destPath = path.join(swaggerUiDir, file);
        
        if (fs.statSync(srcPath).isFile()) {
          fs.copyFileSync(srcPath, destPath);
        }
      });
      
      // Create custom index.html
      const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Charged API Documentation</title>
  <link rel="stylesheet" type="text/css" href="./swagger-ui.css" />
  <link rel="icon" type="image/png" href="./favicon-32x32.png" sizes="32x32" />
  <link rel="icon" type="image/png" href="./favicon-16x16.png" sizes="16x16" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin:0;
      background: #fafafa;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="./swagger-ui-bundle.js"></script>
  <script src="./swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
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
        layout: "StandaloneLayout",
        validatorUrl: null,
        tryItOutEnabled: true,
        supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
        onComplete: function() {
          console.log('Swagger UI loaded successfully');
        },
        onFailure: function(data) {
          console.error('Swagger UI failed to load:', data);
        }
      });
    };
  </script>
</body>
</html>`;
      
      fs.writeFileSync(path.join(swaggerUiDir, 'index.html'), indexHtml);
      console.log(`✅ Swagger UI bundle created: ${swaggerUiDir}`);
    } else {
      throw new Error('Swagger UI dist not found');
    }
  } catch (error) {
    console.log('⚠️  Swagger UI generation failed, creating minimal bundle...');
    
    // Create minimal Swagger UI
    const minimalHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Charged API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: './openapi.json',
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ]
      });
    };
  </script>
</body>
</html>`;
    
    fs.writeFileSync(path.join(swaggerUiDir, 'index.html'), minimalHtml);
    console.log(`✅ Minimal Swagger UI created: ${swaggerUiDir}`);
  }
  
  // Create README for deployment
  const readmeContent = `# Charged API Documentation

This directory contains the generated API documentation bundles.

## Files

- \`openapi.json\` - Complete OpenAPI 3.0 specification
- \`redoc.html\` - Redoc documentation (standalone HTML)
- \`swaggerui/\` - Swagger UI bundle for web deployment
  - \`index.html\` - Main Swagger UI page
  - \`openapi.json\` - OpenAPI specification (copied for Swagger UI)

## Deployment

### Option 1: Static Hosting
Upload the entire \`artifacts/\` directory to your static hosting service.

### Option 2: Server Integration
- Copy \`openapi.json\` to your server's public directory
- Serve \`swaggerui/\` directory at \`/api-docs/\`
- Ensure \`openapi.json\` is accessible at \`/api-docs/openapi.json\`

### Option 3: CDN
- Upload files to your CDN
- Update URLs in HTML files to point to CDN locations

## URLs

- Redoc: \`/api-docs/redoc.html\`
- Swagger UI: \`/api-docs/swaggerui/\`
- OpenAPI JSON: \`/api-docs/openapi.json\`

Generated: ${new Date().toISOString()}
`;

  fs.writeFileSync(path.join(artifactsDir, 'README.md'), readmeContent);
  
  console.log('\n🎉 Documentation bundle complete!');
  console.log(`📁 Output directory: ${artifactsDir}`);
  console.log('📄 Files created:');
  console.log('  - openapi.json (OpenAPI specification)');
  console.log('  - redoc.html (Redoc documentation)');
  console.log('  - swaggerui/ (Swagger UI bundle)');
  console.log('  - README.md (Deployment instructions)');
  console.log('\n🚀 Ready to deploy to https://api.charged.autos/api-docs/');
}

if (require.main === module) {
  bundleDocumentation().catch(console.error);
}

export { bundleDocumentation };
