const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

async function bundleReports() {
  const artifactsDir = path.join(__dirname, '../artifacts');
  const bundlePath = path.join(artifactsDir, 'prod_check_bundle.zip');
  
  console.log('📦 Bundling production test reports...');
  
  // Create zip archive
  const output = fs.createWriteStream(bundlePath);
  const archive = archiver('zip', { zlib: { level: 9 } });
  
  return new Promise((resolve, reject) => {
    output.on('close', () => {
      console.log(`✅ Reports bundled: ${bundlePath} (${archive.pointer()} bytes)`);
      resolve();
    });
    
    archive.on('error', (err) => {
      console.error('❌ Archive error:', err);
      reject(err);
    });
    
    archive.pipe(output);
    
    // Add contract test results
    const contractSummary = path.join(artifactsDir, 'contract-summary.json');
    if (fs.existsSync(contractSummary)) {
      archive.file(contractSummary, { name: 'contract-summary.json' });
    }
    
    const contractReport = path.join(artifactsDir, 'contract-report.md');
    if (fs.existsSync(contractReport)) {
      archive.file(contractReport, { name: 'contract-report.md' });
    }
    
    // Add Playwright results
    const playwrightDir = path.join(artifactsDir, 'playwright-report');
    if (fs.existsSync(playwrightDir)) {
      archive.directory(playwrightDir, 'playwright-report');
    }
    
    const playwrightResults = path.join(artifactsDir, 'playwright-results.json');
    if (fs.existsSync(playwrightResults)) {
      archive.file(playwrightResults, { name: 'playwright-results.json' });
    }
    
    // Add accessibility report
    const axeReport = path.join(artifactsDir, 'axe-report.json');
    if (fs.existsSync(axeReport)) {
      archive.file(axeReport, { name: 'axe-report.json' });
    }
    
    // Create index file
    const indexContent = generateIndexContent(artifactsDir);
    archive.append(indexContent, { name: 'index.md' });
    
    archive.finalize();
  });
}

function generateIndexContent(artifactsDir) {
  const timestamp = new Date().toISOString();
  
  let content = `# Production Cohesion Test Report\n\n`;
  content += `**Generated:** ${timestamp}\n\n`;
  
  content += `## Test Results Summary\n\n`;
  
  // Contract test results
  const contractSummary = path.join(artifactsDir, 'contract-summary.json');
  if (fs.existsSync(contractSummary)) {
    try {
      const contractData = JSON.parse(fs.readFileSync(contractSummary, 'utf8'));
      content += `### API Contract Tests\n`;
      content += `- **Total Endpoints:** ${contractData.totalEndpoints}\n`;
      content += `- **Tested:** ${contractData.testedEndpoints}\n`;
      content += `- **Skipped:** ${contractData.skippedEndpoints}\n`;
      content += `- **Failed:** ${contractData.failedEndpoints}\n`;
      content += `- **Success Rate:** ${((contractData.testedEndpoints / contractData.totalEndpoints) * 100).toFixed(1)}%\n\n`;
    } catch (error) {
      content += `### API Contract Tests\n- Error reading contract summary\n\n`;
    }
  }
  
  // Playwright results
  const playwrightResults = path.join(artifactsDir, 'playwright-results.json');
  if (fs.existsSync(playwrightResults)) {
    try {
      const playwrightData = JSON.parse(fs.readFileSync(playwrightResults, 'utf8'));
      const stats = playwrightData.stats || {};
      content += `### E2E Tests\n`;
      content += `- **Total Tests:** ${stats.total || 0}\n`;
      content += `- **Passed:** ${stats.passed || 0}\n`;
      content += `- **Failed:** ${stats.failed || 0}\n`;
      content += `- **Skipped:** ${stats.skipped || 0}\n\n`;
    } catch (error) {
      content += `### E2E Tests\n- Error reading playwright results\n\n`;
    }
  }
  
  // Accessibility results
  const axeReport = path.join(artifactsDir, 'axe-report.json');
  if (fs.existsSync(axeReport)) {
    try {
      const axeData = JSON.parse(fs.readFileSync(axeReport, 'utf8'));
      const violations = axeData.violations || [];
      content += `### Accessibility Tests\n`;
      content += `- **Violations Found:** ${violations.length}\n`;
      content += `- **Critical Issues:** ${violations.filter(v => v.impact === 'critical').length}\n`;
      content += `- **Serious Issues:** ${violations.filter(v => v.impact === 'serious').length}\n\n`;
    } catch (error) {
      content += `### Accessibility Tests\n- Error reading accessibility report\n\n`;
    }
  }
  
  content += `## Files Included\n\n`;
  content += `- \`contract-summary.json\` - API contract test results\n`;
  content += `- \`contract-report.md\` - Detailed contract test report\n`;
  content += `- \`playwright-report/\` - E2E test HTML report\n`;
  content += `- \`playwright-results.json\` - E2E test JSON results\n`;
  content += `- \`axe-report.json\` - Accessibility test results\n\n`;
  
  content += `## Next Steps\n\n`;
  content += `1. Review failed tests and address issues\n`;
  content += `2. Check accessibility violations for critical issues\n`;
  content += `3. Verify test data cleanup was successful\n`;
  content += `4. Update test configuration if needed\n\n`;
  
  return content;
}

if (require.main === module) {
  bundleReports().catch(console.error);
}

module.exports = { bundleReports };
