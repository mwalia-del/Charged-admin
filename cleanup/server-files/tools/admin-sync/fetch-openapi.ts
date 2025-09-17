#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import SwaggerParser from '@apidevtools/swagger-parser';

interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  paths: Record<string, any>;
  components?: any;
}

class OpenAPIFetcher {
  private baseUrl: string;
  private outputDir: string;

  constructor() {
    this.baseUrl = process.env.BASE_URL || 'https://api.charged.autos';
    this.outputDir = 'artifacts/admin-sync';
  }

  private async ensureOutputDir(): Promise<void> {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  private async tryFetchOpenAPI(url: string): Promise<OpenAPISpec | null> {
    try {
      console.log(`🔍 Trying: ${url}`);
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Charged-Admin-Sync/1.0'
        }
      });

      if (response.status === 200 && response.data) {
        console.log(`✅ Success: ${url}`);
        return response.data;
      }
    } catch (error) {
      console.log(`❌ Failed: ${url} - ${error instanceof Error ? error.message : String(error)}`);
    }
    return null;
  }

  private async scrapeApiDocsForUrl(): Promise<string | null> {
    try {
      console.log(`🔍 Scraping /api-docs/ for OpenAPI URL...`);
      const response = await axios.get(`${this.baseUrl}/api-docs/`, {
        timeout: 10000
      });

      const html = response.data;
      // Look for common patterns that might contain the OpenAPI URL
      const patterns = [
        /url:\s*['"]([^'"]*openapi[^'"]*\.json)['"]/i,
        /url:\s*['"]([^'"]*swagger[^'"]*\.json)['"]/i,
        /url:\s*['"]([^'"]*api-docs[^'"]*\.json)['"]/i,
        /<script[^>]*>.*?url:\s*['"]([^'"]*\.json)['"]/gi
      ];

      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match) {
          const url = match[1];
          // Make it absolute if it's relative
          if (url.startsWith('/')) {
            return `${this.baseUrl}${url}`;
          } else if (url.startsWith('http')) {
            return url;
          } else {
            return `${this.baseUrl}/${url}`;
          }
        }
      }
    } catch (error) {
      console.log(`❌ Failed to scrape /api-docs/: ${error instanceof Error ? error.message : String(error)}`);
    }
    return null;
  }

  async fetch(): Promise<void> {
    console.log('🚀 Fetching authoritative OpenAPI specification...');
    console.log(`Base URL: ${this.baseUrl}`);

    await this.ensureOutputDir();

    // Try different OpenAPI endpoints in order of preference
    const endpoints = [
      process.env.OPENAPI_JSON,
      `${this.baseUrl}/api-docs/openapi.json`,
      `${this.baseUrl}/v3/api-docs`,
      `${this.baseUrl}/api-docs.json`,
      `${this.baseUrl}/openapi.json`
    ].filter(Boolean);

    let spec: OpenAPISpec | null = null;

    // Try direct endpoints first
    for (const endpoint of endpoints) {
      if (endpoint) {
        spec = await this.tryFetchOpenAPI(endpoint);
        if (spec) break;
      }
    }

    // If no direct endpoints worked, try scraping /api-docs/
    if (!spec) {
      const scrapedUrl = await this.scrapeApiDocsForUrl();
      if (scrapedUrl) {
        spec = await this.tryFetchOpenAPI(scrapedUrl);
      }
    }

    if (!spec) {
      throw new Error('❌ Could not fetch OpenAPI specification from any endpoint');
    }

    // Validate the specification
    try {
      console.log('🔍 Validating OpenAPI specification...');
      await SwaggerParser.validate(spec);
      console.log('✅ OpenAPI specification is valid');
    } catch (error) {
      console.warn(`⚠️  OpenAPI validation warning: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Write to output file
    const outputPath = path.join(this.outputDir, 'openapi.json');
    fs.writeFileSync(outputPath, JSON.stringify(spec, null, 2));
    
    console.log(`📊 OpenAPI Stats:`);
    console.log(`  Title: ${spec.info.title}`);
    console.log(`  Version: ${spec.info.version}`);
    console.log(`  Paths: ${Object.keys(spec.paths || {}).length}`);
    console.log(`  Components: ${Object.keys(spec.components || {}).length}`);
    console.log(`✅ Saved to: ${outputPath}`);
  }
}

// Main execution
async function main() {
  try {
    const fetcher = new OpenAPIFetcher();
    await fetcher.fetch();
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

export { OpenAPIFetcher };
