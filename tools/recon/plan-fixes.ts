import fs from "fs";

const hint = `-- SAFE FIX PLAN (views only). Review before applying.
-- Common causes:
-- 1) Timezone mismatch: ensure date_trunc on timestamps at time zone '${process.env.TZ_AUDIT||"UTC"}'
-- 2) Status filters: API may exclude canceled/pending; encode in views explicitly.
-- 3) Soft deletes: add WHERE deleted_at IS NULL when needed.
-- 4) Tenant filters: ensure org/account scoping matches Admin filters.
-- 5) Joins: prefer INNER JOIN where appropriate to avoid duplicate rows.

-- EXAMPLE VIEW TEMPLATES (adjust table/column names):

create or replace view v_admin_rides_daily as
select
  date_trunc('day', (r.ride_completed_at at time zone '${process.env.TZ_AUDIT||"UTC"}'))::date as day,
  r.status,
  count(*) as rides,
  sum(r.fare_cents) as fare_cents
from rides r
where r.ride_completed_at is not null
  and (r.deleted_at is null)
group by 1,2;

create or replace view v_admin_tips_daily as
select
  date_trunc('day', (t.created_at at time zone '${process.env.TZ_AUDIT||"UTC"}'))::date as day,
  count(*) as tips,
  sum(t.amount_cents) as tip_cents
from tips t
where (t.deleted_at is null)
group by 1;

create or replace view v_admin_wallet_driver as
select
  date_trunc('day', (w.created_at at time zone '${process.env.TZ_AUDIT||"UTC"}'))::date as day,
  w.type, w.direction,
  sum(w.amount_cents) as amount_cents
from wallet_transactions w
where w.actor_type='driver' and (w.deleted_at is null)
group by 1,2,3;

-- Add more views as needed and point Admin summaries to these views.
`;

fs.writeFileSync("plan/views.fix.sql", hint);
fs.writeFileSync("plan/data_fix_suggestions.sql", "-- If actual bad data detected, add UPDATE corrections here. NOT EXECUTED.\n");
console.log("✓ plan files -> plan/views.fix.sql, plan/data_fix_suggestions.sql");
