-- ============================================
-- 리바운드에듀 마이그레이션: 소속구분 필드 추가
-- Created: 2026-05-18
-- Purpose: 중개사·외부수강생·일반인 구분을 위한 필수정보 강화
-- 적용: Supabase Dashboard → SQL Editor 실행
-- ============================================

-- 1. users 테이블에 소속 필드 추가
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS affiliation_type TEXT
    CHECK (affiliation_type IN ('rebound_agent', 'external_agent', 'investor', 'general')),
  ADD COLUMN IF NOT EXISTS affiliation_name TEXT,
  ADD COLUMN IF NOT EXISTS branch TEXT,
  ADD COLUMN IF NOT EXISTS marketing_agreed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS profile_completed_at TIMESTAMPTZ;

COMMENT ON COLUMN users.affiliation_type IS
  'rebound_agent: 리바운드 소속 중개사 / external_agent: 외부 중개사 / investor: 투자자·건물주 / general: 일반';
COMMENT ON COLUMN users.affiliation_name IS '소속 회사·사무소명 (자유 입력)';
COMMENT ON COLUMN users.branch IS '지점/지역 (자유 입력, 선택)';

CREATE INDEX IF NOT EXISTS idx_users_affiliation_type ON users(affiliation_type);

-- 2. 기존 사용자 마이그레이션: phone 있고 affiliation_type null인 경우 'general'로 채움
UPDATE users
   SET affiliation_type = 'general',
       profile_completed_at = COALESCE(profile_completed_at, updated_at)
 WHERE phone IS NOT NULL
   AND affiliation_type IS NULL;

-- 3. 검증 쿼리 (참고용)
-- SELECT affiliation_type, COUNT(*) FROM users GROUP BY affiliation_type;
