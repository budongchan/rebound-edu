-- RLS 무한 재귀 수정
-- users 테이블 정책이 자기 자신을 참조하면 infinite recursion 발생
-- security definer 함수로 해결

-- 1. 역할 확인 함수 (RLS 우회)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM users WHERE auth_id = auth.uid() LIMIT 1
$$;

-- 2. 기존 users 정책 삭제 후 재생성
DROP POLICY IF EXISTS users_select ON users;
DROP POLICY IF EXISTS users_insert ON users;
DROP POLICY IF EXISTS users_update ON users;

CREATE POLICY users_select ON users FOR SELECT USING (
    auth_id = auth.uid() OR
    get_my_role() IN ('staff', 'admin')
);

CREATE POLICY users_insert ON users FOR INSERT WITH CHECK (true);

CREATE POLICY users_update ON users FOR UPDATE USING (
    auth_id = auth.uid() OR
    get_my_role() = 'admin'
);

-- 3. courses 정책도 수정
DROP POLICY IF EXISTS courses_select ON courses;
DROP POLICY IF EXISTS courses_insert ON courses;
DROP POLICY IF EXISTS courses_update ON courses;

CREATE POLICY courses_select ON courses FOR SELECT USING (
    status = 'published' OR
    instructor_id IN (SELECT id FROM users WHERE auth_id = auth.uid()) OR
    get_my_role() IN ('staff', 'admin')
);

CREATE POLICY courses_insert ON courses FOR INSERT WITH CHECK (
    instructor_id IN (SELECT id FROM users WHERE auth_id = auth.uid()) OR
    get_my_role() = 'admin'
);

CREATE POLICY courses_update ON courses FOR UPDATE USING (
    instructor_id IN (SELECT id FROM users WHERE auth_id = auth.uid()) OR
    get_my_role() IN ('staff', 'admin')
);

-- 4. enrollments 정책도 수정
DROP POLICY IF EXISTS enrollments_select ON enrollments;
DROP POLICY IF EXISTS enrollments_insert ON enrollments;

CREATE POLICY enrollments_select ON enrollments FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM courses c WHERE c.id = enrollments.course_id AND c.instructor_id IN (SELECT id FROM users WHERE auth_id = auth.uid())) OR
    get_my_role() IN ('staff', 'admin')
);

CREATE POLICY enrollments_insert ON enrollments FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()) OR
    get_my_role() IN ('staff', 'admin')
);
