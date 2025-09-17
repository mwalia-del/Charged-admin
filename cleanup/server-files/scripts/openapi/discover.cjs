#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Route prefixes from app.js mounts
const ROUTE_PREFIXES = {
  '/': 'root',
  '/driver': 'driver', 
  '/admin': 'admin',
  '/ride': 'ride',
  '/payment': 'payment',
  '/catalog': 'catalog'
};

// Discover endpoints from server routes
function discoverServerRoutes() {
  const discovered = [];
  
  // Get server routes from the actual server
  try {
    const serverRoutes = execSync('ssh -i charged-api-server.pem ubuntu@ec2-3-20-152-91.us-east-2.compute.amazonaws.com "cd /home/ubuntu/chargedapi && find ./routes -name \'*.js\'"', { encoding: 'utf8' }).trim().split('\n');
    
    for (const routeFile of serverRoutes) {
      if (!routeFile) continue;
      
      try {
        const routeContent = execSync(`ssh -i charged-api-server.pem ubuntu@ec2-3-20-152-91.us-east-2.compute.amazonaws.com "cd /home/ubuntu/chargedapi && cat ${routeFile}"`, { encoding: 'utf8' });
        
        // Parse Express routes
        const lines = routeContent.split('\n');
        let currentPrefix = '/';
        
        // Determine prefix from file path
        if (routeFile.includes('admin')) currentPrefix = '/admin';
        else if (routeFile.includes('catalog')) currentPrefix = '/catalog';
        else if (routeFile.includes('driver')) currentPrefix = '/driver';
        else if (routeFile.includes('ride')) currentPrefix = '/ride';
        else if (routeFile.includes('payment')) currentPrefix = '/payment';
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          // Match Express route patterns
          const routeMatch = line.match(/router\.(get|post|put|patch|delete|put)\s*\(\s*['"`]([^'"`]+)['"`]/);
          if (routeMatch) {
            const method = routeMatch[1].toUpperCase();
            let routePath = routeMatch[2];
            
            // Normalize dynamic parameters
            routePath = routePath.replace(/:([A-Za-z0-9_]+)/g, '{$1}');
            routePath = routePath.replace(/\$\{([A-Za-z0-9_]+)\}/g, '{$1}');
            
            // Build full path
            const fullPath = currentPrefix === '/' ? routePath : currentPrefix + routePath;
            
            // Extract auth middleware if present
            let authMiddleware = null;
            const nextLines = lines.slice(i, i + 3);
            for (const nextLine of nextLines) {
              if (nextLine.includes('loginAuth') || nextLine.includes('checkAdmin')) {
                authMiddleware = 'bearerAuth';
                break;
              }
            }
            
            discovered.push({
              method,
              path: fullPath,
              file: routeFile,
              line: i + 1,
              auth: authMiddleware,
              service: ROUTE_PREFIXES[currentPrefix] || 'unknown'
            });
          }
        }
      } catch (error) {
        console.warn(`Warning: Could not parse ${routeFile}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Error discovering server routes:', error.message);
  }
  
  return discovered;
}

// Discover endpoints from local route files
function discoverLocalRoutes() {
  const discovered = [];
  
  // Check local route files
  const localRoutes = [
    { file: 'admin_routes_update.js', prefix: '/admin' },
    { file: 'catalog_routes.js', prefix: '/catalog' }
  ];
  
  for (const route of localRoutes) {
    if (!fs.existsSync(route.file)) continue;
    
    const content = fs.readFileSync(route.file, 'utf8');
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Match Express route patterns
      const routeMatch = line.match(/router\.(get|post|put|patch|delete|put)\s*\(\s*['"`]([^'"`]+)['"`]/);
      if (routeMatch) {
        const method = routeMatch[1].toUpperCase();
        let routePath = routeMatch[2];
        
        // Normalize dynamic parameters
        routePath = routePath.replace(/:([A-Za-z0-9_]+)/g, '{$1}');
        routePath = routePath.replace(/\$\{([A-Za-z0-9_]+)\}/g, '{$1}');
        
        // Build full path
        const fullPath = route.prefix === '/' ? routePath : route.prefix + routePath;
        
        // Extract auth middleware if present
        let authMiddleware = null;
        const nextLines = lines.slice(i, i + 3);
        for (const nextLine of nextLines) {
          if (nextLine.includes('loginAuth') || nextLine.includes('checkAdmin')) {
            authMiddleware = 'bearerAuth';
            break;
          }
        }
        
        discovered.push({
          method,
          path: fullPath,
          file: route.file,
          line: i + 1,
          auth: authMiddleware,
          service: ROUTE_PREFIXES[route.prefix] || 'unknown'
        });
      }
    }
  }
  
  return discovered;
}

// Add health endpoints
function addHealthEndpoints() {
  return [
    {
      method: 'GET',
      path: '/health',
      file: 'app.js',
      line: 1,
      auth: null,
      service: 'system'
    },
    {
      method: 'GET', 
      path: '/api/health',
      file: 'app.js',
      line: 1,
      auth: null,
      service: 'system'
    }
  ];
}

// Main discovery function
function main() {
  console.log('🔍 Discovering API endpoints...');
  
  const serverRoutes = discoverServerRoutes();
  const localRoutes = discoverLocalRoutes();
  const healthEndpoints = addHealthEndpoints();
  
  const allRoutes = [...serverRoutes, ...localRoutes, ...healthEndpoints];
  
  // Remove duplicates
  const uniqueRoutes = allRoutes.filter((route, index, self) => 
    index === self.findIndex(r => r.method === route.method && r.path === route.path)
  );
  
  console.log(`📊 Discovered ${uniqueRoutes.length} unique endpoints`);
  
  // Group by service
  const byService = uniqueRoutes.reduce((acc, route) => {
    if (!acc[route.service]) acc[route.service] = [];
    acc[route.service].push(route);
    return acc;
  }, {});
  
  console.log('📋 Endpoints by service:');
  Object.entries(byService).forEach(([service, routes]) => {
    console.log(`  ${service}: ${routes.length} endpoints`);
  });
  
  // Save to file
  const outputPath = 'docs/openapi/artifacts/discovered.json';
  fs.writeFileSync(outputPath, JSON.stringify(uniqueRoutes, null, 2));
  console.log(`💾 Saved to ${outputPath}`);
  
  return uniqueRoutes;
}

if (require.main === module) {
  main();
}

module.exports = { discoverServerRoutes, discoverLocalRoutes, addHealthEndpoints, main };
