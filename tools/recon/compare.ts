import fs from "fs";

const api = JSON.parse(fs.readFileSync("artifacts/recon/api.samples.json","utf8"));

function load(name:string){ 
  try{ 
    return JSON.parse(fs.readFileSync(`artifacts/recon/audit/${name}.json`,"utf8")); 
  }catch{ 
    return []; 
  } 
}

const outDir = "artifacts/recon/diffs"; 
fs.mkdirSync(outDir,{recursive:true});

function write(name:string, lines:string[]){ 
  fs.writeFileSync(`${outDir}/${name}.md`, lines.join("\n")); 
}

function pct(a:number,b:number){ 
  if(b===0) return a===0?0:100; 
  return Math.round(((a-b)/b)*1000)/10; 
}

const reports:string[] = [];

(function rides(){
  const db = load("rides");
  const lines = ["# Rides discrepancies","","| Day | Status | DB rides | DB fare_cents | API note | Δ |","|---|---:|---:|---:|---|---:|"];
  // We don't know exact API shape; print DB truth and note missing API
  for (const r of db){
    lines.push(`| ${r.day} | ${r.status} | ${r.rides} | ${r.fare_cents} | (check admin /rides/summary) | — |`);
  }
  write("rides", lines);
  reports.push("- rides → see diffs/rides.md");
})();

(function tips(){
  const db = load("tips");
  const lines = ["# Tips discrepancies","","| Day | DB tips | DB tip_cents | API note |","|---|---:|---:|---|"];
  for (const r of db){ 
    lines.push(`| ${r.day} | ${r.tips} | ${r.tip_cents} | (check admin /tips/summary) |`); 
  }
  write("tips", lines); 
  reports.push("- tips → diffs/tips.md");
})();

(function wallet(){
  const db = load("wallet");
  const lines = ["# Wallet discrepancies","","| Day | Type | DB credits | DB debits | API note |","|---|---|---:|---:|---|"];
  for (const r of db){ 
    lines.push(`| ${r.day} | ${r.type} | ${r.credits} | ${r.debits} | (check admin /wallet/summary) |`); 
  }
  write("wallet", lines); 
  reports.push("- wallet → diffs/wallet.md");
})();

(function payouts(){
  const db = load("payouts");
  const lines = ["# Payouts discrepancies","","| Day | Status | DB requests | DB amount_cents | API note |","|---|---|---:|---:|---|"];
  for (const r of db){ 
    lines.push(`| ${r.day} | ${r.status} | ${r.requests} | ${r.amount_cents} | (check admin /payouts/summary) |`); 
  }
  write("payouts", lines); 
  reports.push("- payouts → diffs/payouts.md");
})();

(function referrals(){
  const db = load("referrals");
  const lines = ["# Referrals discrepancies","","| Day | Tier | DB issuances | DB amount_cents | API note |","|---|---|---:|---:|---|"];
  for (const r of db){ 
    lines.push(`| ${r.day} | ${r.tier} | ${r.issuances} | ${r.amount_cents} | (check admin /referrals/summary) |`); 
  }
  write("referrals", lines); 
  reports.push("- referrals → diffs/referrals.md");
})();

(function invoices(){
  const db = load("invoices");
  const lines = ["# Invoices discrepancies","","| Month | Status | DB invoices | DB total_cents | API note |","|---|---|---:|---:|---|"];
  for (const r of db){ 
    lines.push(`| ${r.month} | ${r.status} | ${r.invoices} | ${r.total_cents} | (check admin /invoices/summary) |`); 
  }
  write("invoices", lines); 
  reports.push("- invoices → diffs/invoices.md");
})();

(function businesses(){
  const db = load("businesses");
  const lines = ["# Businesses discrepancies","","| Day | Invoice accts | Credit accts | API note |","|---|---:|---:|---|"];
  for (const r of db){ 
    lines.push(`| ${r.day} | ${r.invoice_accts} | ${r.credit_accts} | (check admin /businesses/summary) |`); 
  }
  write("businesses", lines); 
  reports.push("- businesses → diffs/businesses.md");
})();

const summary = `# Reconciliation Summary

Artifacts:
${reports.join("\n")}

Next: inspect API vs DB logic (tz, filters, soft deletes, joins).
`;
fs.writeFileSync("artifacts/recon/SUMMARY.md", summary);
console.log("✓ diffs -> artifacts/recon/diffs/*.md");
