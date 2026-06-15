alter table edu_orders
  add column if not exists receipt_type text,
  add column if not exists cash_receipt_phone text,
  add column if not exists receipt_payload jsonb;
