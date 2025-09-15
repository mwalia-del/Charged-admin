#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ProductionTestRunner {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      steps: [],
      summary: {
        totalSteps: 0,
        passedSteps: 0,
        failedSteps: 0,
        skippedSteps: 0
      },
      artifacts: []
    };
  }

  async run() {
    console.log('🚀 Starting Production Cohesion Tests');
    console.log('=====================================\n');

    try {
      // Step 1: Prepare state
      await this.runStep('Prepare Admin State', () => {
        execSync('npm run prod:state:generate', { stdio: 'inherit' });
      });

      // Step 2: Contract Tests
      await this.runStep('API Contract Tests', () => {
        execSync('npm run prod:contract', { stdio: 'inherit' });
      });

      // Step 3: E2E Smoke Tests
      await this.runStep('E2E Smoke Tests', () => {
        execSync('npm run prod:smoke --grep "@smoke"', { stdio: 'inherit' });
      });

      // Step 4: Minimal Write Tests
      await this.runStep('Minimal Write Tests', () => {
        execSync('npm run prod:smoke --grep "@writes"', { stdio: 'inherit' });
      });

      // Step 5: Accessibility Tests
      await this.runStep('Accessibility Tests', () => {
        execSync('npm run prod:ui:a11y', { stdio: 'inherit' });
      });

      // Step 6: Bundle Reports
      await this.runStep('Bundle Reports', () => {
        execSync('npm run prod:report:bundle', { stdio: 'inherit' });
      });

      // Generate final summary
      this.generateFinalSummary();

    } catch (error) {
      console.error('❌ Production tests failed:', error.message);
      process.exit(1);
    }
  }

  async runStep(stepName, stepFunction) {
    console.log(`\n📋 ${stepName}`);
    console.log('─'.repeat(50));
    
    const startTime = Date.now();
    let status = 'passed';
    let error = null;

    try {
      await stepFunction();
      console.log(`✅ ${stepName} completed successfully`);
    } catch (err) {
      status = 'failed';
      error = err.message;
      console.log(`❌ ${stepName} failed: ${error}`);
    }

    const duration = Date.now() - startTime;
    
    this.results.steps.push({
      name: stepName,
      status,
      duration,
      error
    });

    this.results.summary.totalSteps++;
    this.results.summary[`${status}Steps`]++;

    return status === 'passed';
  }

  generateFinalSummary() {
    console.log('\n📊 Production Test Summary');
    console.log('==========================');
    
    const { totalSteps, passedSteps, failedSteps, skippedSteps } = this.results.summary;
    
    console.log(`Total Steps: ${totalSteps}`);
    console.log(`Passed: ${passedSteps} ✅`);
    console.log(`Failed: ${failedSteps} ❌`);
    console.log(`Skipped: ${skippedSteps} ⏭️`);
    console.log(`Success Rate: ${((passedSteps / totalSteps) * 100).toFixed(1)}%`);

    // Check for artifacts
    this.checkArtifacts();

    // Generate detailed report
    this.generateDetailedReport();

    // Print next steps
    this.printNextSteps();

    // Save results
    this.saveResults();
  }

  checkArtifacts() {
    const artifactsDir = path.join(__dirname, '../artifacts');
    
    const artifactFiles = [
      'contract-summary.json',
      'contract-report.md',
      'playwright-report/index.html',
      'playwright-results.json',
      'axe-report.json',
      'prod_check_bundle.zip'
    ];

    console.log('\n📁 Generated Artifacts:');
    artifactFiles.forEach(file => {
      const filePath = path.join(artifactsDir, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`✅ ${file} (${this.formatBytes(stats.size)})`);
        this.results.artifacts.push({
          name: file,
          path: filePath,
          size: stats.size,
          exists: true
        });
      } else {
        console.log(`❌ ${file} (missing)`);
        this.results.artifacts.push({
          name: file,
          path: filePath,
          size: 0,
          exists: false
        });
      }
    });
  }

  generateDetailedReport() {
    const reportPath = path.join(__dirname, '../artifacts/production-test-summary.json');
    const artifactsDir = path.join(__dirname, '../artifacts');
    
    if (!fs.existsSync(artifactsDir)) {
      fs.mkdirSync(artifactsDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed report saved: ${reportPath}`);
  }

  printNextSteps() {
    console.log('\n🎯 Next Steps:');
    console.log('==============');
    
    if (this.results.summary.failedSteps > 0) {
      console.log('1. Review failed tests and address issues');
      console.log('2. Check console output for specific error details');
      console.log('3. Verify environment variables are correctly set');
    }
    
    console.log('4. Check accessibility violations for critical issues');
    console.log('5. Verify test data cleanup was successful');
    console.log('6. Review contract test results for API changes');
    console.log('7. Update test configuration if needed');
    
    console.log('\n📋 Environment Variables Required:');
    console.log('- BASE_URL=https://api.charged.autos');
    console.log('- ADMIN_TOKEN_PROD_TEST=<jwt for test admin>');
    console.log('- ORG_TEST_ID=<uuid of dedicated test org>');
    console.log('- RIDER_TEST_ID=<test rider uuid>');
    console.log('- DRIVER_TEST_ID=<test driver uuid>');
  }

  saveResults() {
    const resultsPath = path.join(__dirname, '../artifacts/test-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Run the production tests
if (require.main === module) {
  const runner = new ProductionTestRunner();
  runner.run().catch(console.error);
}

module.exports = ProductionTestRunner;
