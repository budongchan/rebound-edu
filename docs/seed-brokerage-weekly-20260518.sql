-- ============================================
-- 중개실무 매주 정기 교육 시드 (임시 단일 course 우회 등록)
-- Created: 2026-05-18
-- 주의: 회차 모델(Phase B) 완성 전 임시 운영용
--       매주 회차가 추가되면 admin이 신규 course로 추가하거나
--       이 course를 복제하여 사용
-- 적용: Supabase Dashboard → SQL Editor 실행
-- ============================================

-- 0. 강사 계정 보장 (김동찬 — 기존 시드에 있음, 없을 때만 생성)
INSERT INTO users (id, email, name, role, is_active, is_approved, affiliation_type, affiliation_name, profile_completed_at)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'dongchan@rebound.co.kr',
  '김동찬',
  'teacher',
  true,
  true,
  'rebound_agent',
  '리바운드부동산',
  now()
)
ON CONFLICT (email) DO UPDATE
  SET role = 'teacher',
      affiliation_type = COALESCE(users.affiliation_type, 'rebound_agent'),
      affiliation_name = COALESCE(users.affiliation_name, '리바운드부동산'),
      profile_completed_at = COALESCE(users.profile_completed_at, now());

-- 1. 중개실무 정기 교육 (매주 라이브) — 임시 placeholder
INSERT INTO courses (
  id, instructor_id, title, subtitle, description,
  price, discount_price, category, difficulty, status,
  total_lectures, total_duration_sec,
  published_at, kakao_chat_url
) VALUES (
  'c1000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  '중개실무 라이브 — 1회차',
  '매주 진행되는 중개사 대상 실무 교육 (1회차)',
  '리바운드 소속·외부 중개사를 위한 매주 정기 실무 교육입니다.

[운영 안내]
• 진행 형태: 오프라인 + 줌 라이브 동시 진행 (선택 가능)
• 정원: 30명
• 신청 마감: 회차 진행 2시간 전까지
• 수강 대상: 공인중개사·중개보조원·중개사무소 운영자

[1회차 주제]
※ 운영자가 admin/teacher 메뉴에서 정확한 일정·주제·줌링크를 수정해 주세요.

문의: 카카오톡 채널 또는 운영팀',
  0,         -- 가격: 무료
  NULL,
  'brokerage',
  'beginner',
  'published',
  0, 0,
  now(),
  NULL       -- 카카오톡 채널 URL: admin에서 추가
)
ON CONFLICT (id) DO UPDATE
  SET title = EXCLUDED.title,
      subtitle = EXCLUDED.subtitle,
      description = EXCLUDED.description,
      price = EXCLUDED.price,
      status = EXCLUDED.status,
      published_at = COALESCE(courses.published_at, now());

-- 2. 검증 쿼리 (참고용)
-- SELECT id, title, price, status FROM courses WHERE title LIKE '중개실무%';
