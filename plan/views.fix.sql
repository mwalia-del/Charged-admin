-- SAFE FIX PLAN (views only). Review before applying.
-- Common causes:
-- 1) Timezone mismatch: ensure date_trunc on timestamps at time zone 'America/Halifax'
-- 2) Status filters: API may exclude canceled/pending; encode in views explicitly.
-- 3) Soft deletes: add WHERE deleted_at IS NULL when needed.
-- 4) Tenant filters: ensure org/account scoping matches Admin filters.
-- 5) Joins: prefer INNER JOIN where appropriate to avoid duplicate rows.

-- EXAMPLE VIEW TEMPLATES (adjust table/column names):

create or replace view v_admin_rides_daily as
select
  date_trunc('day', (r.completed_at at time zone 'America/Halifax'))::date as day,
  r.status,
  count(*) as rides,
  sum(r.total_fare) as total_fare
from rides r
where r.completed_at is not null
  and (r.deleted_at is null)
group by 1,2;

create or replace view v_admin_tips_daily as
select
  date_trunc('day', (t.added_at at time zone 'America/Halifax'))::date as day,
  count(*) as tips,
  sum(t.tip_amount) as tip_amount
from driver_tips t
where (t.deleted_at is null)
group by 1;

create or replace view v_admin_wallet_driver as
select
  date_trunc('day', (w.created_at at time zone 'America/Halifax'))::date as day,
  w.type, 
  sum(case when w.amount_cents > 0 then w.amount_cents else 0 end) as credits,
  sum(case when w.amount_cents < 0 then abs(w.amount_cents) else 0 end) as debits
from wallet_ledger w
where (w.deleted_at is null)
group by 1,2;

-- Add more views as needed and point Admin summaries to these views.
