-- ============================================
-- 리바운드에듀 강의 시드 데이터
-- Created: 2026-03-19
--
-- 사용법: Supabase Dashboard > SQL Editor에서 실행
-- ============================================

-- 1. 강사 계정 생성 (이미 존재하면 건너뜀)
-- 김동찬 (대표)
INSERT INTO users (id, email, name, role, is_active)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'dongchan@rebound.co.kr',
  '김동찬',
  'teacher',
  true
)
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
RETURNING id;

-- 투자N
INSERT INTO users (id, email, name, role, is_active)
VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'investor_n@rebound.co.kr',
  '투자N',
  'teacher',
  true
)
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
RETURNING id;

-- 2. 강의 등록 (6개)

-- ① 투자N의 26년 내집마련 유료특강 (3만원)
INSERT INTO courses (
  id, instructor_id, title, subtitle, description,
  price, category, difficulty, status, published_at
) VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000002',
  '26년 내집마련 유료특강',
  '투자N이 알려주는 2026년 내집마련 전략',
  '2026년 부동산 시장 흐름을 읽고, 실수요자가 내집마련에 성공하기 위한 실전 전략을 배웁니다.

• 2026년 부동산 시장 전망과 핵심 변수
• 청약·매매·경매 채널별 내집마련 로드맵
• 대출 규제 변화와 자금 조달 전략
• 실수요자를 위한 입지 분석 체크리스트',
  30000,
  'investment',
  'beginner',
  'published',
  now()
);

-- ② 호스텔 유료 특강 (15만원)
INSERT INTO courses (
  id, instructor_id, title, subtitle, description,
  price, category, difficulty, status, published_at
) VALUES (
  'c0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000001',
  '호스텔 창업 유료 특강',
  '김동찬 대표의 호스텔 창업 A to Z',
  '호스텔·게스트하우스 창업의 전 과정을 3시간에 압축합니다.

• 입지 선정부터 인허가까지 실전 프로세스
• 수익 구조 설계와 손익분기점 분석
• 운영 자동화 시스템 구축법
• 실제 운영 사례와 실패 회피 전략',
  150000,
  'hostel',
  'intermediate',
  'published',
  now()
);

-- ③ 법인 활용 유료 특강 (15만원)
INSERT INTO courses (
  id, instructor_id, title, subtitle, description,
  price, category, difficulty, status, published_at
) VALUES (
  'c0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000001',
  '법인 활용 유료 특강',
  '부동산 법인의 설립부터 절세까지',
  '부동산 투자·사업에서 법인을 활용하는 핵심 전략을 배웁니다.

• 법인 설립 절차와 정관 작성 포인트
• 개인 vs 법인 세금 비교 분석
• 법인 부동산 취득·보유·양도 시 절세 전략
• 법인 활용 시 주의할 세무 리스크',
  150000,
  'investment',
  'intermediate',
  'published',
  now()
);

-- ④ 중개입문 수업 (3만원)
INSERT INTO courses (
  id, instructor_id, title, subtitle, description,
  price, category, difficulty, status, published_at
) VALUES (
  'c0000000-0000-0000-0000-000000000004',
  'a0000000-0000-0000-0000-000000000001',
  '중개입문 수업',
  '공인중개사 실무의 첫걸음',
  '공인중개사 자격 취득 후, 실무 현장에서 바로 활용할 수 있는 입문 과정입니다.

• 중개사무소 개설 절차와 준비사항
• 매물 확보와 고객 응대 기초
• 계약서 작성과 확인·설명 의무
• 중개보수 산정과 세금 신고 기초',
  30000,
  'brokerage',
  'beginner',
  'published',
  now()
);

-- ⑤ 중개심화 수업 (5만원)
INSERT INTO courses (
  id, instructor_id, title, subtitle, description,
  price, category, difficulty, status, published_at
) VALUES (
  'c0000000-0000-0000-0000-000000000005',
  'a0000000-0000-0000-0000-000000000001',
  '중개심화 수업',
  '매출을 높이는 중개 실전 테크닉',
  '현장 경험 기반의 고급 중개 기법과 매출 극대화 전략을 다룹니다.

• 고가 물건 중개와 VIP 고객 관리법
• 상업용 부동산·토지 중개 실무
• 세금 컨설팅을 결합한 차별화 전략
• 중개법인 운영과 직영점 확장 노하우',
  50000,
  'brokerage',
  'advanced',
  'published',
  now()
);

-- ⑥ 비싼 사람들을 위한 값싼 AI 활용법 (무료, 3시간)
INSERT INTO courses (
  id, instructor_id, title, subtitle, description,
  price, category, difficulty, total_duration_sec, status, published_at
) VALUES (
  'c0000000-0000-0000-0000-000000000006',
  'a0000000-0000-0000-0000-000000000001',
  '비싼 사람들을 위한 값싼 AI 활용법',
  '김동찬 대표의 3시간 무료 특강',
  '시급이 비싼 전문직·사업가를 위한 AI 자동화 활용 특강입니다.

• ChatGPT·Claude 등 생성형 AI 실무 활용법
• 반복 업무 자동화로 시간 절약하기
• AI를 활용한 콘텐츠 제작과 마케팅
• 부동산·중개 업무에 특화된 AI 워크플로우',
  0,
  'ai_automation',
  'beginner',
  10800,
  'published',
  now()
);

-- 확인
SELECT id, title, price, category, status FROM courses ORDER BY created_at;
