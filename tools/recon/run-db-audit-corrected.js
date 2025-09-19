const { Client } = require("pg");
const fs = require("fs");

const url = process.env.PG_URL || "postgres://postgres:postgres@localhost:5432/charged";
const tz  = process.env.TZ_AUDIT || "UTC";
const since = new Date(); 
since.setMonth(since.getMonth()-3);
const start = since.toISOString().slice(0,10);

const Q = {
  rides: `
    with base as (
      select
        date_trunc('day', (completed_at at time zone $1))::date as day,
        status,
        count(*) as rides,
        sum(total_fare) as total_fare
      from rides
      where completed_at >= $2 and completed_at is not null
      group by 1,2
    )
    select day, status, rides, total_fare from base order by day, status;
  `,
  tips: `
    select date_trunc('day', (created_at at time zone $1))::date as day,
           count(*) as tips, sum(amount) as tip_amount
    from driver_tips
    where created_at >= $2
    group by 1 order by 1;
  `,
  wallet: `
    select
      date_trunc('day', (created_at at time zone $1))::date as day,
      'transaction' as type,
      sum(case when amount > 0 then amount else 0 end) as credits,
      sum(case when amount < 0 then abs(amount) else 0 end) as debits
    from wallet_ledger
    where created_at >= $2
    group by 1,2 order by 1,2;
  `,
  payouts: `
    select
      date_trunc('day', (created_at at time zone $1))::date as day,
      'completed' as status,
      count(*) as requests,
      sum(amount) as amount
    from referral_payouts
    where created_at >= $2
    group by 1,2 order by 1,2;
  `,
  referrals: `
    select
      date_trunc('day', (created_at at time zone $1))::date as day,
      'standard' as tier,
      count(*) as registrations,
      sum(reward_amount) as reward_amount
    from referral_registrations
    where created_at >= $2
    group by 1,2 order by 1,2;
  `,
  invoices: `
    select
      date_trunc('month', (created_at at time zone $1))::date as month,
      'active' as status,
      count(*) as invoices,
      sum(0) as total_amount
    from businesses
    where created_at >= $2::date
    group by 1,2 order by 1,2;
  `,
  businesses: `
    select
      date_trunc('day', (created_at at time zone $1))::date as day,
      count(*) filter (where billing_mode='invoice') as invoice_accts,
      count(*) filter (where billing_mode='credit')  as credit_accts
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
    } catch (error) {
      console.error(`✗ ${name} audit failed:`, error.message);
      fs.writeFileSync(`${outDir}/${name}.json`, JSON.stringify([],null,2));
    }
  }
  
  await c.end();
  console.log("✓ db audit -> artifacts/recon/audit/*.json");
})();
