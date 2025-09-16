# Charged API Documentation

This directory contains the generated API documentation bundles.

## Files

- `openapi.json` - Complete OpenAPI 3.0 specification
- `redoc.html` - Redoc documentation (standalone HTML)
- `swaggerui/` - Swagger UI bundle for web deployment
  - `index.html` - Main Swagger UI page
  - `openapi.json` - OpenAPI specification (copied for Swagger UI)

## Deployment

### Option 1: Static Hosting
Upload the entire `artifacts/` directory to your static hosting service.

### Option 2: Server Integration
- Copy `openapi.json` to your server's public directory
- Serve `swaggerui/` directory at `/api-docs/`
- Ensure `openapi.json` is accessible at `/api-docs/openapi.json`

### Option 3: CDN
- Upload files to your CDN
- Update URLs in HTML files to point to CDN locations

## URLs

- Redoc: `/api-docs/redoc.html`
- Swagger UI: `/api-docs/swaggerui/`
- OpenAPI JSON: `/api-docs/openapi.json`

Generated: 2025-09-15T03:06:53.494Z
