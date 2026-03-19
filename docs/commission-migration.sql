-- ================================================
-- 의뢰(용역) 관리 시스템 마이그레이션
-- Supabase SQL Editor에서 실행
-- ================================================

-- 1. commissions 테이블 생성
CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 관계
  client_id UUID NOT NULL REFERENCES users(id),       -- 의뢰인 (수강생)
  expert_id UUID NOT NULL REFERENCES users(id),        -- 전문가 (교사)
  course_id UUID REFERENCES courses(id),               -- 연결된 강의 (선택)
  -- 의뢰 정보
  title TEXT NOT NULL,                                 -- 의뢰 제목
  description TEXT,                                    -- 상세 설명
  service_type TEXT CHECK (service_type IN (
    'consulting',   -- 컨설팅
    'development',  -- 기획/개발
    'design',       -- 디자인
    'marketing',    -- 마케팅
    'filming',      -- 촬영
    'editing',      -- 편집
    'other'         -- 기타
  )),
  -- 금액
  estimated_amount INT DEFAULT 0,                      -- 의뢰인 희망 예산
  final_amount INT DEFAULT 0,                          -- 최종 확정 금액
  platform_fee_pct INT DEFAULT 10,                     -- 플랫폼 수수료율 (%)
  platform_fee INT DEFAULT 0,                          -- 플랫폼 수수료 금액
  expert_payout INT DEFAULT 0,                         -- 전문가 지급액
  -- 상태
  status TEXT DEFAULT 'requested' CHECK (status IN (
    'requested',    -- 의뢰 신청됨
    'accepted',     -- 전문가 수락
    'rejected',     -- 전문가 거절
    'in_progress',  -- 진행 중
    'completed',    -- 작업 완료
    'settled',      -- 정산 완료
    'cancelled'     -- 취소
  )),
  -- 일정
  requested_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  settled_at TIMESTAMPTZ,
  -- 메모
  client_memo TEXT,                                    -- 의뢰인 요청 메모
  expert_memo TEXT,                                    -- 전문가 메모
  admin_memo TEXT,                                     -- 관리자/직원 메모
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 인덱스
CREATE INDEX IF NOT EXISTS idx_commissions_client_id ON commissions(client_id);
CREATE INDEX IF NOT EXISTS idx_commissions_expert_id ON commissions(expert_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_course_id ON commissions(course_id);

-- 3. updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_commissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_commissions_updated_at
  BEFORE UPDATE ON commissions
  FOR EACH ROW
  EXECUTE FUNCTION update_commissions_updated_at();

-- 4. RLS 활성화
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

-- 의뢰인(학생): 본인이 신청한 의뢰만 조회
CREATE POLICY "commission_client_select" ON commissions
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- 의뢰인(학생): 본인 의뢰 INSERT
CREATE POLICY "commission_client_insert" ON commissions
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- 전문가(교사): 본인이 받은 의뢰 조회
CREATE POLICY "commission_expert_select" ON commissions
  FOR SELECT USING (
    expert_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- 전문가(교사): 본인이 받은 의뢰 상태 변경 (수락/거절/진행/완료)
CREATE POLICY "commission_expert_update" ON commissions
  FOR UPDATE USING (
    expert_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- 직원/관리자: 전체 조회
CREATE POLICY "commission_staff_select" ON commissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('staff', 'admin')
    )
  );

-- 직원/관리자: 전체 수정 (정산 처리, 메모 등)
CREATE POLICY "commission_staff_update" ON commissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('staff', 'admin')
    )
  );
