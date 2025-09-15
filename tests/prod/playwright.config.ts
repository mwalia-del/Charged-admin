import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';
import path from 'path';

// Load production test environment variables
config({ path: path.resolve(__dirname, '../../.env.prod-test') });

const baseURL = process.env.BASE_URL || 'https://api.charged.autos';
const adminDashboardURL = process.env.ADMIN_DASHBOARD_URL || 'https://admin.charged.autos';

export default defineConfig({
  testDir: './tests/prod/e2e',
  fullyParallel: false, // Run tests sequentially for production safety
  forbidOnly: !!process.env.CI,
  retries: 1, // Minimal retries for production
  workers: 1, // Single worker for production safety
  reporter: [
    ['list'],
    ['html', { outputFolder: 'tests/prod/artifacts/playwright-report' }],
    ['json', { outputFile: 'tests/prod/artifacts/playwright-results.json' }]
  ],
  use: {
    baseURL: adminDashboardURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  timeout: 30000, // Conservative timeout for production
  expect: {
    timeout: 10000,
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'tests/prod/state/admin.json'
      },
    },
  ],
  webServer: {
    command: 'echo "No local server needed for production tests"',
    port: 3000,
    reuseExistingServer: true,
  },
});
