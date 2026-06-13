-- 리바운드에듀 계좌이체 결제 시스템
-- 은행 입금 알림은 공통 입금 이벤트로 먼저 저장하고,
-- 고객이 주문 상태 페이지에서 확인할 때 edu_orders와 매칭한다.

create table if not exists bank_deposit_notifications (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  raw_text text,
  bank text,
  notified_date text,
  notified_time text,
  account_masked text,
  account_suffix text,
  transaction_type text,
  amount integer,
  depositor_name text,
  is_deposit boolean not null default false,
  is_expected_account boolean,
  status text not null default 'received',
  matched boolean not null default false,
  confirmed_at timestamptz,
  matched_by text,
  metadata jsonb not null default '{}'::jsonb
);

alter table bank_deposit_notifications add column if not exists raw_text text;
alter table bank_deposit_notifications add column if not exists created_at timestamptz not null default now();
alter table bank_deposit_notifications add column if not exists bank text;
alter table bank_deposit_notifications add column if not exists notified_date text;
alter table bank_deposit_notifications add column if not exists notified_time text;
alter table bank_deposit_notifications add column if not exists account_masked text;
alter table bank_deposit_notifications add column if not exists account_suffix text;
alter table bank_deposit_notifications add column if not exists transaction_type text;
alter table bank_deposit_notifications add column if not exists amount integer;
alter table bank_deposit_notifications add column if not exists depositor_name text;
alter table bank_deposit_notifications add column if not exists is_deposit boolean not null default false;
alter table bank_deposit_notifications add column if not exists is_expected_account boolean;
alter table bank_deposit_notifications add column if not exists status text not null default 'received';
alter table bank_deposit_notifications add column if not exists matched boolean not null default false;
alter table bank_deposit_notifications add column if not exists confirmed_at timestamptz;
alter table bank_deposit_notifications add column if not exists matched_by text;
alter table bank_deposit_notifications add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists idx_bank_deposit_notifications_match
  on bank_deposit_notifications (matched, is_deposit, is_expected_account, amount, created_at desc);
create index if not exists idx_bank_deposit_notifications_depositor
  on bank_deposit_notifications (depositor_name);
create index if not exists idx_bank_deposit_notifications_created
  on bank_deposit_notifications (created_at desc);

create table if not exists sms_outbox (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  channel text not null default 'sms',
  status text not null default 'queued',
  phone text not null,
  message text not null,
  service_id text,
  platform text,
  product text,
  target_table text,
  target_id text,
  order_id text,
  deposit_event_id bigint,
  dedupe_key text,
  claimed_at timestamptz,
  sent_at timestamptz,
  error text,
  metadata jsonb not null default '{}'::jsonb
);

alter table sms_outbox add column if not exists updated_at timestamptz not null default now();
alter table sms_outbox add column if not exists created_at timestamptz not null default now();
alter table sms_outbox add column if not exists channel text not null default 'sms';
alter table sms_outbox add column if not exists status text not null default 'queued';
alter table sms_outbox add column if not exists phone text;
alter table sms_outbox add column if not exists message text;
alter table sms_outbox add column if not exists service_id text;
alter table sms_outbox add column if not exists platform text;
alter table sms_outbox add column if not exists product text;
alter table sms_outbox add column if not exists target_table text;
alter table sms_outbox add column if not exists target_id text;
alter table sms_outbox add column if not exists order_id text;
alter table sms_outbox add column if not exists deposit_event_id bigint;
alter table sms_outbox add column if not exists dedupe_key text;
alter table sms_outbox add column if not exists claimed_at timestamptz;
alter table sms_outbox add column if not exists sent_at timestamptz;
alter table sms_outbox add column if not exists error text;
alter table sms_outbox add column if not exists metadata jsonb not null default '{}'::jsonb;

create unique index if not exists idx_sms_outbox_dedupe_key
  on sms_outbox (dedupe_key)
  where dedupe_key is not null;
create index if not exists idx_sms_outbox_queue
  on sms_outbox (status, created_at);
create index if not exists idx_sms_outbox_order_id
  on sms_outbox (order_id);

create table if not exists sms_router_heartbeats (
  id bigserial primary key,
  device_id text not null,
  service_id text not null default 'edu',
  last_seen_at timestamptz not null default now(),
  app_version text,
  battery_pct integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (device_id, service_id)
);

alter table sms_router_heartbeats add column if not exists device_id text;
alter table sms_router_heartbeats add column if not exists service_id text not null default 'edu';
alter table sms_router_heartbeats add column if not exists last_seen_at timestamptz not null default now();
alter table sms_router_heartbeats add column if not exists app_version text;
alter table sms_router_heartbeats add column if not exists battery_pct integer;
alter table sms_router_heartbeats add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table sms_router_heartbeats add column if not exists created_at timestamptz not null default now();

create unique index if not exists idx_sms_router_heartbeats_device_service
  on sms_router_heartbeats (device_id, service_id);
create index if not exists idx_sms_router_heartbeats_last_seen
  on sms_router_heartbeats (last_seen_at desc);
