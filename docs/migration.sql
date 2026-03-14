-- ============================================
-- 리바운드에듀 DB 마이그레이션 (클린 설치)
-- 기존 객체 삭제 후 재생성
-- ============================================

-- 뷰 삭제
DROP VIEW IF EXISTS v_instructor_summary CASCADE;
DROP VIEW IF EXISTS v_course_stats CASCADE;

-- 테이블 삭제 (의존 역순)
DROP TABLE IF EXISTS settlement_items CASCADE;
DROP TABLE IF EXISTS settlements CASCADE;
DROP TABLE IF EXISTS cs_messages CASCADE;
DROP TABLE IF EXISTS cs_tickets CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS coupon_usages CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS refunds CASCADE;
DROP TABLE IF EXISTS payment_items CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS qna_answers CASCADE;
DROP TABLE IF EXISTS qna_questions CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS progress CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS lectures CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 타입 삭제
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS course_status CASCADE;
DROP TYPE IF EXISTS course_category CASCADE;
DROP TYPE IF EXISTS enrollment_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS refund_status CASCADE;
DROP TYPE IF EXISTS discount_type CASCADE;
DROP TYPE IF EXISTS qna_status CASCADE;
DROP TYPE IF EXISTS schedule_type CASCADE;
DROP TYPE IF EXISTS cs_category CASCADE;
DROP TYPE IF EXISTS cs_status CASCADE;
DROP TYPE IF EXISTS settlement_status CASCADE;
DROP TYPE IF EXISTS notification_channel CASCADE;

-- ============================================
-- Enums
-- ============================================
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
-- 1. Users
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'student',
    avatar_url TEXT,
    social_accounts JSONB DEFAULT '{}',
    interests TEXT[],
    staff_memo TEXT,
    staff_tags TEXT[],
    is_approved BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth_id ON users(auth_id);

-- ============================================
-- 2. Courses
-- ============================================
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    price INTEGER NOT NULL DEFAULT 0,
    discount_price INTEGER,
    thumbnail_url TEXT,
    preview_video_url TEXT,
    status course_status NOT NULL DEFAULT 'draft',
    category course_category NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    total_lectures INTEGER DEFAULT 0,
    total_duration_sec INTEGER DEFAULT 0,
    revenue_share_pct INTEGER DEFAULT 70,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_category ON courses(category);

-- ============================================
-- 3. Lectures
-- ============================================
CREATE TABLE lectures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    section_title TEXT,
    order_num INTEGER NOT NULL,
    title TEXT NOT NULL,
    video_url TEXT,
    video_asset_id TEXT,
    duration_sec INTEGER DEFAULT 0,
    is_preview BOOLEAN DEFAULT false,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_lectures_course ON lectures(course_id);

-- ============================================
-- 4. Enrollments
-- ============================================
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    status enrollment_status NOT NULL DEFAULT 'active',
    progress_pct INTEGER DEFAULT 0,
    enrolled_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    UNIQUE(user_id, course_id)
);

CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);

-- ============================================
-- 5. Progress
-- ============================================
CREATE TABLE progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    lecture_id UUID NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
    watched_sec INTEGER DEFAULT 0,
    last_position INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(enrollment_id, lecture_id)
);

CREATE INDEX idx_progress_enrollment ON progress(enrollment_id);

-- ============================================
-- 6. Payments
-- ============================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    pg_order_id TEXT UNIQUE,
    pg_payment_key TEXT,
    total_amount INTEGER NOT NULL,
    discount_amount INTEGER DEFAULT 0,
    final_amount INTEGER NOT NULL,
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
-- 7. Payment Items
-- ============================================
CREATE TABLE payment_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id),
    price INTEGER NOT NULL,
    discount INTEGER DEFAULT 0
);

-- ============================================
-- 8. Refunds
-- ============================================
CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id),
    amount INTEGER NOT NULL,
    reason TEXT,
    status refund_status NOT NULL DEFAULT 'requested',
    processed_by UUID REFERENCES users(id),
    requested_at TIMESTAMPTZ DEFAULT now(),
    processed_at TIMESTAMPTZ
);

CREATE INDEX idx_refunds_status ON refunds(status);

-- ============================================
-- 9. Coupons
-- ============================================
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    discount_type discount_type NOT NULL,
    discount_value INTEGER NOT NULL,
    min_purchase INTEGER DEFAULT 0,
    max_discount INTEGER,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    applicable_courses UUID[],
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 10. Coupon Usages
-- ============================================
CREATE TABLE coupon_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES coupons(id),
    payment_id UUID NOT NULL REFERENCES payments(id),
    user_id UUID NOT NULL REFERENCES users(id),
    discount_applied INTEGER NOT NULL,
    used_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(coupon_id, user_id)
);

-- ============================================
-- 11. QnA Questions
-- ============================================
CREATE TABLE qna_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    lecture_id UUID REFERENCES lectures(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_urls TEXT[],
    video_timestamp INTEGER,
    status qna_status NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_qna_questions_course ON qna_questions(course_id);
CREATE INDEX idx_qna_questions_status ON qna_questions(status);

-- ============================================
-- 12. QnA Answers
-- ============================================
CREATE TABLE qna_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES qna_questions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 13. Reviews
-- ============================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    content TEXT,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, course_id)
);

CREATE INDEX idx_reviews_course ON reviews(course_id);

-- ============================================
-- 14. Schedules
-- ============================================
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    course_id UUID REFERENCES courses(id),
    type schedule_type NOT NULL,
    title TEXT NOT NULL,
    memo TEXT,
    location TEXT,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_rule TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_schedules_user ON schedules(user_id);
CREATE INDEX idx_schedules_start ON schedules(start_at);

-- ============================================
-- 15. CS Tickets
-- ============================================
CREATE TABLE cs_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
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
-- 16. CS Messages
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
-- 17. Settlements
-- ============================================
CREATE TABLE settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID NOT NULL REFERENCES users(id),
    period_year INTEGER NOT NULL,
    period_month INTEGER NOT NULL,
    total_revenue INTEGER NOT NULL,
    platform_fee INTEGER NOT NULL,
    net_amount INTEGER NOT NULL,
    status settlement_status NOT NULL DEFAULT 'pending',
    settled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(instructor_id, period_year, period_month)
);

-- ============================================
-- 18. Settlement Items
-- ============================================
CREATE TABLE settlement_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    settlement_id UUID NOT NULL REFERENCES settlements(id) ON DELETE CASCADE,
    payment_id UUID NOT NULL REFERENCES payments(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    amount INTEGER NOT NULL,
    fee INTEGER NOT NULL,
    refund_deduction INTEGER DEFAULT 0
);

-- ============================================
-- 19. Notifications
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    channel notification_channel NOT NULL DEFAULT 'in_app',
    title TEXT NOT NULL,
    content TEXT,
    link_url TEXT,
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);

-- ============================================
-- 20. Announcements
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
-- RLS
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_select ON users FOR SELECT USING (
    auth_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.role IN ('staff', 'admin'))
);
CREATE POLICY users_insert ON users FOR INSERT WITH CHECK (true);
CREATE POLICY users_update ON users FOR UPDATE USING (
    auth_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.role = 'admin')
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY courses_select ON courses FOR SELECT USING (
    status = 'published' OR
    instructor_id IN (SELECT id FROM users WHERE auth_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.role IN ('staff', 'admin'))
);
CREATE POLICY courses_insert ON courses FOR INSERT WITH CHECK (
    instructor_id IN (SELECT id FROM users WHERE auth_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.role = 'admin')
);
CREATE POLICY courses_update ON courses FOR UPDATE USING (
    instructor_id IN (SELECT id FROM users WHERE auth_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.role IN ('staff', 'admin'))
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY enrollments_select ON enrollments FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM courses c WHERE c.id = enrollments.course_id AND c.instructor_id IN (SELECT id FROM users WHERE auth_id = auth.uid())) OR
    EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.role IN ('staff', 'admin'))
);
CREATE POLICY enrollments_insert ON enrollments FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.role IN ('staff', 'admin'))
);

-- ============================================
-- Views
-- ============================================
CREATE VIEW v_course_stats AS
SELECT
    c.id AS course_id, c.title, c.instructor_id,
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

CREATE VIEW v_instructor_summary AS
SELECT
    u.id AS instructor_id, u.name,
    COUNT(DISTINCT c.id) AS course_count,
    COALESCE(SUM(cs.total_enrollments), 0) AS total_students,
    COALESCE(SUM(cs.total_revenue), 0) AS total_revenue
FROM users u
JOIN courses c ON c.instructor_id = u.id AND c.status = 'published'
LEFT JOIN v_course_stats cs ON cs.course_id = c.id
WHERE u.role = 'teacher'
GROUP BY u.id, u.name;
