# Server Files Cleanup

This directory contains server-side files that were moved from the main project directory to create a clean frontend-only structure.

## 📁 Contents

### Backend Files
- **Controllers**: `controllers/` - Server-side business logic
- **Routes**: `routes/` - API route definitions
- **Database**: `db/` - Database configuration and migrations
- **Scripts**: `scripts/` - Server management and deployment scripts

### Server Configuration
- **Main App**: `app_updated.js` - Express application setup
- **Route Files**: Various `*_routes.js` files
- **Database**: `db.js` - Database connection configuration
- **Deployment**: `*.sh` shell scripts for deployment

### Documentation
- **API Documentation**: `docs/` - OpenAPI/Swagger documentation
- **Server Management**: `*SERVER*.md` files
- **API Schemas**: `*API*.md` files
- **Database Config**: `*DATABASE*.md` files
- **Implementation**: `*IMPLEMENTATION*.md` files

### Tools & Artifacts
- **Tools**: `tools/` - Development and management tools
- **Artifacts**: `artifacts/` - Generated documentation and reports
- **Tests**: `tests/prod/` and `tests/api/` - Server-related tests

### Security
- **SSH Key**: `charged-api-server.pem` - Server access key

## 🎯 Purpose

These files were moved to:
1. **Separate Concerns**: Keep frontend and backend code separate
2. **Clean Structure**: Create a production-ready frontend directory
3. **Reduce Confusion**: Avoid mixing server and client code
4. **Better Organization**: Maintain clear project boundaries

## 📋 Usage

If you need to work with the server-side code:
1. Copy the relevant files back to your server project
2. Or work directly from this cleanup directory
3. The server files are fully functional and ready to use

## ⚠️ Note

This cleanup was performed to create a clean React frontend project. The server files are preserved and can be restored if needed.
