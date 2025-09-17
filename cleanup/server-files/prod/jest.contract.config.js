module.exports = {
  displayName: 'Production Contract Tests',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/prod/contract/**/*.spec.ts'],
  collectCoverage: false,
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/tests/prod/setup.ts'],
  testTimeout: 30000,
  maxWorkers: 3, // Respect rate limits
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './tests/prod/artifacts',
      filename: 'contract-report.html',
      expand: true
    }]
  ],
  globals: {
    'ts-jest': {
      tsconfig: {
        target: 'es2020',
        module: 'commonjs',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: true,
        skipLibCheck: true
      }
    }
  },
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}'
  ]
};
