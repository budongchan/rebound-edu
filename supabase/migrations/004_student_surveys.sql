-- 수강생 사전 질문지 저장.

create table if not exists edu_student_surveys (
  id bigserial primary key,
  order_id text not null unique,
  edu_order_id bigint,
  course_id text,
  course_title text,
  buyer_name text,
  buyer_phone text,
  buyer_email text,
  startup_type text,
  prep_started_month text,
  target_open_month text,
  budget text,
  interested_area text,
  residence_area text,
  hospitality_experience text,
  has_support text,
  support_detail text,
  hardest_point text,
  attendance_type text,
  fieldwork_availability text[] not null default '{}',
  payload jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_edu_student_surveys_order_id on edu_student_surveys (order_id);
create index if not exists idx_edu_student_surveys_course_id on edu_student_surveys (course_id);
create index if not exists idx_edu_student_surveys_submitted_at on edu_student_surveys (submitted_at desc);

alter table edu_student_surveys enable row level security;
grant select, insert, update, delete on edu_student_surveys to service_role;
grant usage, select on sequence edu_student_surveys_id_seq to service_role;

alter table edu_orders add column if not exists student_survey jsonb;
alter table edu_orders add column if not exists student_survey_submitted_at timestamptz;
