#!/usr/bin/env ts-node

// Test script to verify reconciliation system setup
import fs from "fs";
import path from "path";

console.log("🧪 Testing Data Reconciliation System Setup...\n");

// Test 1: Check if all required files exist
const requiredFiles = [
  "tools/recon/snapshot-schema.ts",
  "tools/recon/fetch-api-samples.ts", 
  "tools/recon/run-db-audit.ts",
  "tools/recon/compare.ts",
  "tools/recon/plan-fixes.ts",
  "tools/recon/apply-views.ts",
  "tools/recon/README.md",
  "tools/recon/RUNBOOK.md",
  "tools/recon/env.example"
];

console.log("📁 Checking required files...");
let allFilesExist = true;
for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    allFilesExist = false;
  }
}

// Test 2: Check if directories exist
const requiredDirs = [
  "artifacts/recon",
  "plan"
];

console.log("\n📂 Checking required directories...");
for (const dir of requiredDirs) {
  if (fs.existsSync(dir)) {
    console.log(`  ✅ ${dir}`);
  } else {
    console.log(`  ❌ ${dir} - MISSING`);
    allFilesExist = false;
  }
}

// Test 3: Check package.json scripts
console.log("\n📦 Checking package.json scripts...");
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const requiredScripts = [
  "recon:schema",
  "recon:api", 
  "recon:db",
  "recon:compare",
  "recon:plan",
  "recon:apply",
  "recon:all"
];

for (const script of requiredScripts) {
  if (packageJson.scripts[script]) {
    console.log(`  ✅ ${script}`);
  } else {
    console.log(`  ❌ ${script} - MISSING`);
    allFilesExist = false;
  }
}

// Test 4: Check dependencies
console.log("\n🔧 Checking dependencies...");
const requiredDeps = ["ts-node", "pg", "@types/pg"];
for (const dep of requiredDeps) {
  if (packageJson.devDependencies[dep]) {
    console.log(`  ✅ ${dep}`);
  } else {
    console.log(`  ❌ ${dep} - MISSING`);
    allFilesExist = false;
  }
}

// Test 5: Check environment file
console.log("\n🌍 Checking environment configuration...");
if (fs.existsSync("tools/recon/.env")) {
  console.log("  ✅ .env file exists");
} else {
  console.log("  ⚠️  .env file missing - copy from env.example");
}

// Summary
console.log("\n" + "=".repeat(50));
if (allFilesExist) {
  console.log("🎉 All checks passed! System is ready to use.");
  console.log("\nNext steps:");
  console.log("1. Copy tools/recon/env.example to tools/recon/.env");
  console.log("2. Edit .env with your actual values");
  console.log("3. Run: npm run recon:all");
} else {
  console.log("❌ Some checks failed. Please fix the issues above.");
  process.exit(1);
}
