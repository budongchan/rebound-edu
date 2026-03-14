# 리바운드에듀 (REBOUND EDU)

## 프로젝트 개요
부동산·공간사업 전문 온라인 교육 플랫폼. (주)리바운드 그룹이 운영.
강의 카테고리: 중개업, 숙박업, 사업장, AI자동화, 투자개발

## 기술 스택
- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS (Noto Sans KR 폰트)
- **Backend/DB**: Supabase (PostgreSQL + Auth + Storage + RLS)
- **Deploy**: Vercel
- **Payment**: 토스페이먼츠 (추후)
- **VOD**: Mux 또는 Cloudflare Stream (추후)
- **Chat**: 채널톡 (플로팅 버튼)

## 브랜드 가이드
- Primary Color: `#FF6600` (Safety Orange)
- Primary Light: `#FFF7ED`
- Font: Noto Sans KR (300~900)
- 깔끔한 화이트 배경, 카드 기반 UI, 인프런 스타일 참고

## 사용자 역할 (RBAC)
| 역할 | 경로 | 가입 방식 |
|------|------|-----------|
| student (학생) | `/student` | 즉시 가입 |
| teacher (교사) | `/teacher` | 관리자 승인 필요 |
| staff (직원) | `/staff` | 관리자 승인 필요 |
| admin (관리자) | `/admin` | 관리자 승인 필요 |

## 인증 플로우
1. 회원가입 시 역할 선택 (학생은 즉시, 나머지는 승인 대기)
2. 로그인 후 → 역할 선택 화면 (보유 권한 목록 표시)
3. 역할 선택 → 해당 대시보드 진입
4. 사이드바 하단 "공간 전환"으로 역할 간 이동

## 프로젝트 구조
```
src/
├── app/
│   ├── page.tsx                    # 랜딩 페이지
│   ├── layout.tsx                  # 루트 레이아웃
│   ├── globals.css                 # 글로벌 CSS
│   ├── auth/
│   │   ├── login/page.tsx          # 로그인 (카카오/Google/이메일)
│   │   ├── signup/page.tsx         # 회원가입 (역할 선택 포함)
│   │   ├── callback/route.ts       # OAuth 콜백
│   │   └── select-role/page.tsx    # 로그인 후 역할 선택
│   └── (dashboard)/
│       ├── layout.tsx              # 사이드바 + 헤더 공유 레이아웃
│       ├── student/page.tsx        # 학생 대시보드
│       ├── teacher/page.tsx        # 교사 대시보드
│       ├── staff/page.tsx          # 직원 대시보드
│       └── admin/page.tsx          # 관리자 대시보드
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   └── ui/
│       ├── Badge.tsx
│       ├── StatCard.tsx
│       ├── CourseCard.tsx
│       └── ChannelTalk.tsx         # 채널톡 플로팅 버튼
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # 브라우저용
│   │   ├── server.ts               # 서버용
│   │   └── middleware.ts            # 인증 미들웨어
│   └── utils.ts
├── types/
│   └── index.ts                    # 타입 + 역할별 메뉴 설정
└── middleware.ts
```

## DB 스키마 (Supabase)
`docs/schema.sql` 참고. 핵심 테이블:
- users (auth_id, email, name, role, is_active, is_approved)
- courses, lectures, enrollments, progress
- payments, refunds, coupons
- qna_questions, qna_answers, reviews
- schedules, cs_tickets, settlements, notifications

## 개발 명령어
```bash
npm run dev      # 개발 서버 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # 린트 검사
```

## 환경변수 (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 디자인 원칙
- 인프런 스타일 참고: 깔끔한 화이트 + 카드 기반
- 상단 헤더: 로고 + 로그인/회원가입만 (카테고리 네비 없음)
- 채널톡 상담 버튼: 우측 하단 플로팅 (모든 페이지)
- 색상: #FF6600 (오렌지), #f8f9fa (배경), #212529 (텍스트)
- 폰트: Noto Sans KR, 모든 요소에 명시적 적용

## 참고 문서
- `docs/schema.sql` — 전체 DB DDL
- `docs/feature-spec.md` — 역할별 기능 명세
- `docs/prototype-design.jsx` — React 프로토타입 (디자인 레퍼런스)
