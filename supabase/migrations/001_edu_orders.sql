-- edu_orders: 수강 신청/주문
create table if not exists edu_orders (
  id uuid primary key default gen_random_uuid(),
  order_id text unique not null,
  course_id text not null,
  course_title text not null,
  amount integer not null default 0,
  buyer_name text not null,
  buyer_email text not null,
  buyer_phone text not null,
  depositor_name text not null,
  status text not null default '입금대기',
  paid_at timestamptz,
  deposit_confirmed_at timestamptz,
  payment_method text,
  created_at timestamptz not null default now()
);

-- edu_deposit_notifications: SMS 입금 알림 파싱 결과
create table if not exists edu_deposit_notifications (
  id uuid primary key default gen_random_uuid(),
  raw_text text,
  bank text,
  account_masked text,
  account_suffix text,
  transaction_type text,
  amount integer,
  depositor_name text,
  notified_date text,
  notified_time text,
  is_deposit boolean not null default false,
  is_expected_account boolean not null default false,
  matched boolean not null default false,
  matched_order_id text,
  confirmed_at timestamptz,
  matched_by text,
  status text not null default 'unmatched',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- 미매칭 입금 빠른 조회용
create index if not exists idx_edu_deposit_match
  on edu_deposit_notifications (amount, depositor_name, is_deposit, is_expected_account, matched)
  where matched = false and is_deposit = true;

-- 주문 조회용
create index if not exists idx_edu_orders_order_id
  on edu_orders (order_id);
