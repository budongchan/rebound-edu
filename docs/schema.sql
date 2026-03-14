-- ============================================
-- 리바운드에듀 DB 스키마 (Supabase / PostgreSQL)
-- Created: 2026-03-14
-- Version: 1.0
-- ============================================

-- Enums
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'staff', 'admin');
CREATE TYPE course_status AS ENUM ('draft', 'review', 'revision', 'approved', 'published', 'archived');
CREATE TYPE course_category AS ENUM ('vacancy', 'brokerage', 'hostel', 'ai_automation', 'investment', 'other');
CREATE TYPE enrollment_status AS ENUM ('active', 'completed', 'expired', 'refunded');
CREATE TYPE payment_method AS ENUM ('card', 'bank_transfer', 'toss', 'kakao', 'naver');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'cancelled', 'refunded', 'partial_refund');
CREATE TYPE refund_status AS ENUM ('requested', 'approved', 'rejected', 'processed');
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');
CREATE TYPE qna_status AS ENUM ('open', 'answered', 'closed');
CREATE TYPE schedule_type AS ENUM ('filming', 'rehearsal', 'free_lecture', 'main_lecture', 'editing_review', 'other');
CREATE TYPE cs_category AS ENUM ('refund', 'payment_error', 'lecture_inquiry', 'certificate', 'account', 'other');
CREATE TYPE cs_status AS ENUM ('pending', 'in_progress', 'resolved', 'closed');
CREATE TYPE settlement_status AS ENUM ('pending', 'confirmed', 'paid');
CREATE TYPE notification_channel AS ENUM ('in_app', 'kakao', 'email', 'sms');

-- ============================================
-- 1. Users (Supabase Auth 연동)
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE, -- Supabase Auth user id
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'student',
    avatar_url TEXT,
    social_accounts JSONB DEFAULT '{}', -- {"kakao": "...", "naver": "...", "google": "..."}
    interests TEXT[], -- 관심 분야 태그
    staff_memo TEXT, -- 직원용 내부 메모
    staff_tags TEXT[], -- 직원용 분류 태그
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- 2. Courses (강의)
-- ============================================
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    price INTEGER NOT NULL DEFAULT 0, -- 원 단위
    discount_price INTEGER, -- 할인가 (null이면 할인 없음)
    thumbnail_url TEXT,
    preview_video_url TEXT,
    status course_status NOT NULL DEFAULT 'draft',
    category course_category NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    total_lectures INTEGER DEFAULT 0,
    total_duration_sec INTEGER DEFAULT 0,
    revenue_share_pct INTEGER DEFAULT 70, -- 교사 수익 배분율 (%)
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_category ON courses(category);

-- ============================================
-- 3. Lectures (강의 차시)
-- ============================================
CREATE TABLE lectures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    section_title TEXT, -- 섹션(파트) 이름
    order_num INTEGER NOT NULL,
    title TEXT NOT NULL,
    video_url TEXT, -- Mux/Cloudflare Stream playback ID
    video_asset_id TEXT, -- 원본 asset ID
    duration_sec INTEGER DEFAULT 0,
    is_preview BOOLEAN DEFAULT false,
    attachments JSONB DEFAULT '[]', -- [{name, url, size}]
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_lectures_course ON lectures(course_id);

-- ============================================
-- 4. Enrollments (수강 등록)
-- ============================================
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    status enrollment_status NOT NULL DEFAULT 'active',
    progress_pct INTEGER DEFAULT 0, -- 0~100
    enrolled_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ, -- 수강 기한 (null = 무제한)
    UNIQUE(user_id, course_id)
);

CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);

-- ============================================
-- 5. Progress (차시별 진도)
-- ============================================
CREATE TABLE progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    lecture_id UUID NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
    watched_sec INTEGER DEFAULT 0,
    last_position INTEGER DEFAULT 0, -- 마지막 시청 위치 (초)
    is_completed BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(enrollment_id, lecture_id)
);

CREATE INDEX idx_progress_enrollment ON progress(enrollment_id);

-- ============================================
-- 6. Payments (결제)
-- ============================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    pg_order_id TEXT UNIQUE, -- PG사 주문번호
    pg_payment_key TEXT, -- PG사 결제키 (토스페이먼츠)
    total_amount INTEGER NOT NULL, -- 정가 합계
    discount_amount INTEGER DEFAULT 0, -- 할인 합계
    final_amount INTEGER NOT NULL, -- 실결제액
    method payment_method,
    status payment_status NOT NULL DEFAULT 'pending',
    receipt_url TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_paid_at ON payments(paid_at);

-- ============================================
-- 7. Payment Items (결제 항목)
-- ============================================
CREATE TABLE payment_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id),
    price INTEGER NOT NULL,
    discount INTEGER DEFAULT 0
);

-- ============================================
-- 8. Refunds (환불)
-- ============================================
CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id),
    amount INTEGER NOT NULL,
    reason TEXT,
    status refund_status NOT NULL DEFAULT 'requested',
    processed_by UUID REFERENCES users(id), -- 처리 직원
    requested_at TIMESTAMPTZ DEFAULT now(),
    processed_at TIMESTAMPTZ
);

CREATE INDEX idx_refunds_status ON refunds(status);

-- ============================================
-- 9. Coupons (쿠폰)
-- ============================================
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    discount_type discount_type NOT NULL,
    discount_value INTEGER NOT NULL, -- % 또는 원
    min_purchase INTEGER DEFAULT 0,
    max_discount INTEGER, -- 최대 할인액 (% 할인 시)
    max_uses INTEGER, -- null = 무제한
    used_count INTEGER DEFAULT 0,
    applicable_courses UUID[], -- null = 전체 적용
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 10. Coupon Usages (쿠폰 사용 이력)
-- ============================================
CREATE TABLE coupon_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES coupons(id),
    payment_id UUID NOT NULL REFERENCES payments(id),
    user_id UUID NOT NULL REFERENCES users(id),
    discount_applied INTEGER NOT NULL,
    used_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(coupon_id, user_id) -- 1인 1회 사용
);

-- ============================================
-- 11. QnA Questions (Q&A 질문)
-- ============================================
CREATE TABLE qna_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    lecture_id UUID REFERENCES lectures(id), -- 특정 차시 연결 (선택)
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_urls TEXT[],
    video_timestamp INTEGER, -- 영상 시점 (초)
    status qna_status NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_qna_questions_course ON qna_questions(course_id);
CREATE INDEX idx_qna_questions_status ON qna_questions(status);

-- ============================================
-- 12. QnA Answers (Q&A 답변)
-- ============================================
CREATE TABLE qna_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES qna_questions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id), -- 답변자 (교사/직원)
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 13. Reviews (수강 후기)
-- ============================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    content TEXT,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, course_id) -- 강의당 1개 후기
);

CREATE INDEX idx_reviews_course ON reviews(course_id);

-- ============================================
-- 14. Schedules (교사 스케줄)
-- ============================================
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id), -- 교사
    course_id UUID REFERENCES courses(id),
    type schedule_type NOT NULL,
    title TEXT NOT NULL,
    memo TEXT,
    location TEXT,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_rule TEXT, -- RRULE 형식
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_schedules_user ON schedules(user_id);
CREATE INDEX idx_schedules_start ON schedules(start_at);

-- ============================================
-- 15. CS Tickets (고객 상담)
-- ============================================
CREATE TABLE cs_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id), -- 문의자
    assigned_to UUID REFERENCES users(id), -- 담당 직원
    category cs_category NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    status cs_status NOT NULL DEFAULT 'pending',
    related_payment_id UUID REFERENCES payments(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_cs_tickets_status ON cs_tickets(status);
CREATE INDEX idx_cs_tickets_assigned ON cs_tickets(assigned_to);

-- ============================================
-- 16. CS Ticket Messages (상담 메시지)
-- ============================================
CREATE TABLE cs_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES cs_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 17. Settlements (교사 정산)
-- ============================================
CREATE TABLE settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID NOT NULL REFERENCES users(id),
    period_year INTEGER NOT NULL,
    period_month INTEGER NOT NULL, -- 1~12
    total_revenue INTEGER NOT NULL, -- 해당 기간 총 매출
    platform_fee INTEGER NOT NULL, -- 플랫폼 수수료
    net_amount INTEGER NOT NULL, -- 교사 정산액
    status settlement_status NOT NULL DEFAULT 'pending',
    settled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(instructor_id, period_year, period_month)
);

-- ============================================
-- 18. Settlement Items (정산 상세)
-- ============================================
CREATE TABLE settlement_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    settlement_id UUID NOT NULL REFERENCES settlements(id) ON DELETE CASCADE,
    payment_id UUID NOT NULL REFERENCES payments(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    amount INTEGER NOT NULL, -- 해당 건 매출
    fee INTEGER NOT NULL, -- 해당 건 수수료
    refund_deduction INTEGER DEFAULT 0 -- 환불 차감액
);

-- ============================================
-- 19. Notifications (알림)
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    channel notification_channel NOT NULL DEFAULT 'in_app',
    title TEXT NOT NULL,
    content TEXT,
    link_url TEXT, -- 클릭 시 이동 경로
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);

-- ============================================
-- 20. Announcements (공지사항)
-- ============================================
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT CHECK (type IN ('notice', 'banner', 'popup')),
    is_pinned BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    start_at TIMESTAMPTZ,
    end_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- RLS (Row Level Security) 예시
-- ============================================

-- 학생은 자신의 수강 정보만 조회
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY enrollment_student_select ON enrollments
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('staff', 'admin'))
    );

-- 교사는 자신의 강의 수강생만 조회
CREATE POLICY enrollment_teacher_select ON enrollments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM courses c
            WHERE c.id = enrollments.course_id
            AND c.instructor_id = auth.uid()
        )
    );

-- ============================================
-- 자주 사용하는 뷰
-- ============================================

-- 강의별 통계 뷰
CREATE VIEW v_course_stats AS
SELECT
    c.id AS course_id,
    c.title,
    c.instructor_id,
    COUNT(DISTINCT e.id) AS total_enrollments,
    COUNT(DISTINCT CASE WHEN e.status = 'completed' THEN e.id END) AS completions,
    COALESCE(AVG(r.rating), 0) AS avg_rating,
    COUNT(DISTINCT r.id) AS review_count,
    COALESCE(SUM(pi.price - pi.discount), 0) AS total_revenue
FROM courses c
LEFT JOIN enrollments e ON e.course_id = c.id
LEFT JOIN reviews r ON r.course_id = c.id
LEFT JOIN payment_items pi ON pi.course_id = c.id
    AND EXISTS (SELECT 1 FROM payments p WHERE p.id = pi.payment_id AND p.status = 'paid')
GROUP BY c.id, c.title, c.instructor_id;

-- 교사 정산 요약 뷰
CREATE VIEW v_instructor_summary AS
SELECT
    u.id AS instructor_id,
    u.name,
    COUNT(DISTINCT c.id) AS course_count,
    COALESCE(SUM(cs.total_enrollments), 0) AS total_students,
    COALESCE(SUM(cs.total_revenue), 0) AS total_revenue
FROM users u
JOIN courses c ON c.instructor_id = u.id AND c.status = 'published'
LEFT JOIN v_course_stats cs ON cs.course_id = c.id
WHERE u.role = 'teacher'
GROUP BY u.id, u.name;
