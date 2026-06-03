-- edu_orders: 수강 신청/주문
-- bank_deposit_notifications는 공유 Supabase(오피스 프로젝트)에 이미 존재.
-- 이 마이그레이션은 edu_orders 단독으로 실행.

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
  payment_method text,
  paid_at timestamptz,
  deposit_confirmed_at timestamptz,
  deposit_valid_until timestamptz,
  tax_invoice_requested boolean not null default false,
  tax_invoice_business_number text,
  tax_invoice_email text,
  tax_invoice_requested_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_edu_orders_order_id on edu_orders (order_id);
create index if not exists idx_edu_orders_status on edu_orders (status);
