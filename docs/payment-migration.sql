-- ──────────────────────────────────────────────────
-- 포트원(PortOne) V2 결제 연동을 위한 마이그레이션
-- Supabase 대시보드 > SQL Editor에서 실행
-- ──────────────────────────────────────────────────

-- 1. pg_payment_key 유니크 인덱스 (중복 결제 방지)
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_pg_payment_key
ON payments(pg_payment_key) WHERE pg_payment_key IS NOT NULL;

-- 2. portone_tx_id 컬럼 추가 (포트원 트랜잭션 ID 저장)
ALTER TABLE payments ADD COLUMN IF NOT EXISTS portone_tx_id TEXT;

-- 3. enrollments 테이블에 UNIQUE 제약 추가 (중복 수강 방지)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'enrollments_user_course_unique'
  ) THEN
    ALTER TABLE enrollments ADD CONSTRAINT enrollments_user_course_unique
    UNIQUE (user_id, course_id);
  END IF;
END $$;

-- 4. payments RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있을 경우)
DROP POLICY IF EXISTS payments_select ON payments;
DROP POLICY IF EXISTS payments_insert ON payments;
DROP POLICY IF EXISTS payments_update ON payments;

-- 학생 본인 결제 조회 + 직원/관리자 전체 조회
CREATE POLICY payments_select ON payments FOR SELECT USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.role IN ('staff', 'admin'))
);

-- 본인 결제 삽입
CREATE POLICY payments_insert ON payments FOR INSERT WITH CHECK (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);

-- 본인 + 직원/관리자 업데이트
CREATE POLICY payments_update ON payments FOR UPDATE USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.role IN ('staff', 'admin'))
);

-- 5. payment_items RLS
ALTER TABLE payment_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS payment_items_select ON payment_items;
DROP POLICY IF EXISTS payment_items_insert ON payment_items;

CREATE POLICY payment_items_select ON payment_items FOR SELECT USING (
  payment_id IN (
    SELECT id FROM payments WHERE user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  ) OR
  EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.role IN ('staff', 'admin'))
);

CREATE POLICY payment_items_insert ON payment_items FOR INSERT WITH CHECK (
  payment_id IN (
    SELECT id FROM payments WHERE user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  )
);

-- 6. refunds RLS (환불 테이블)
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS refunds_select ON refunds;
DROP POLICY IF EXISTS refunds_insert ON refunds;

CREATE POLICY refunds_select ON refunds FOR SELECT USING (
  payment_id IN (
    SELECT id FROM payments WHERE user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  ) OR
  EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.role IN ('staff', 'admin'))
);

CREATE POLICY refunds_insert ON refunds FOR INSERT WITH CHECK (
  payment_id IN (
    SELECT id FROM payments WHERE user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  )
);
