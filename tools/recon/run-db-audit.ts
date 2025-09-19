import { Client } from "pg";
import fs from "fs";

const url = process.env.PG_URL!;
const tz  = process.env.TZ_AUDIT || "UTC";
const since = new Date(); 
since.setMonth(since.getMonth()-3);
const start = since.toISOString().slice(0,10);

const Q = {
  rides: `
    with base as (
      select
        date_trunc('day', (ride_completed_at at time zone $1))::date as day,
        status,
        count(*) as rides,
        sum(fare_cents) as fare_cents
      from rides
      where ride_completed_at >= $2
      group by 1,2
    )
    select day, status, rides, fare_cents from base order by day, status;
  `,
  tips: `
    select date_trunc('day', (created_at at time zone $1))::date as day,
           count(*) as tips, sum(amount_cents) as tip_cents
    from tips
    where created_at >= $2
    group by 1 order by 1;
  `,
  wallet: `
    select
      date_trunc('day', (created_at at time zone $1))::date as day,
      type,
      sum(case when direction='credit' then amount_cents else 0 end) as credits,
      sum(case when direction='debit'  then amount_cents else 0 end) as debits
    from wallet_transactions
    where created_at >= $2 and actor_type='driver'
    group by 1,2 order by 1,2;
  `,
  payouts: `
    select
      date_trunc('day', (created_at at time zone $1))::date as day,
      status,
      count(*) as requests,
      sum(amount_cents) as amount_cents
    from wallet_payout_requests
    where created_at >= $2 and actor_type='driver'
    group by 1,2 order by 1,2;
  `,
  referrals: `
    select
      date_trunc('day', (created_at at time zone $1))::date as day,
      tier,
      count(*) as issuances,
      sum(amount_cents) as amount_cents
    from referral_issuances
    where created_at >= $2
    group by 1,2 order by 1,2;
  `,
  invoices: `
    select
      date_trunc('month', (period_start at time zone $1))::date as month,
      status,
      count(*) as invoices,
      sum(total_cents) as total_cents
    from invoices
    where period_start >= $2::date
    group by 1,2 order by 1,2;
  `,
  businesses: `
    select
      date_trunc('day', (created_at at time zone $1))::date as day,
      count(*) filter (where billing_type='invoice') as invoice_accts,
      count(*) filter (where billing_type='credit')  as credit_accts
    from businesses
    where created_at >= $2
    group by 1 order by 1;
  `
};

(async()=>{
  const c = new Client({ connectionString: url });
  await c.connect();
  const outDir = "artifacts/recon/audit";
  fs.mkdirSync(outDir, {recursive:true});
  
  for (const [name, sql] of Object.entries(Q)) {
    try {
      const res = await c.query(sql, [tz, start]);
      fs.writeFileSync(`${outDir}/${name}.json`, JSON.stringify(res.rows,null,2));
      console.log(`✓ ${name} audit completed`);
    } catch (error: any) {
      console.error(`✗ ${name} audit failed:`, error.message);
      fs.writeFileSync(`${outDir}/${name}.json`, JSON.stringify([],null,2));
    }
  }
  
  await c.end();
  console.log("✓ db audit -> artifacts/recon/audit/*.json");
})();
