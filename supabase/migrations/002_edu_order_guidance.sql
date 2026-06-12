-- edu_orders guidance snapshot fields.
-- Code can derive guidance from course_id, but these columns preserve the exact
-- class place and links that were shown at checkout time.

alter table edu_orders add column if not exists course_schedule text;
alter table edu_orders add column if not exists course_place text;
alter table edu_orders add column if not exists course_address text;
alter table edu_orders add column if not exists course_naver_place_url text;
alter table edu_orders add column if not exists course_group_chat_url text;
alter table edu_orders add column if not exists course_inquiry_url text;
