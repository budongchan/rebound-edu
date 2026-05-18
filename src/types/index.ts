export type UserRole = "student" | "teacher" | "staff" | "admin";

export type AffiliationType = "rebound_agent" | "external_agent" | "investor" | "general";

export interface User {
  id: string;
  auth_id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  is_approved: boolean;
  is_active: boolean;
  affiliation_type?: AffiliationType | null;
  affiliation_name?: string | null;
  branch?: string | null;
  marketing_agreed?: boolean;
  profile_completed_at?: string | null;
  created_at: string;
}

export const AFFILIATION_OPTIONS: { value: AffiliationType; label: string; desc: string }[] = [
  { value: "rebound_agent", label: "리바운드 소속 중개사", desc: "리바운드 그룹 소속" },
  { value: "external_agent", label: "외부 중개사", desc: "타 사무소 공인중개사" },
  { value: "investor", label: "투자자·건물주", desc: "부동산 투자/자산 관리" },
  { value: "general", label: "일반", desc: "위 항목에 해당하지 않음" },
];

export const AFFILIATION_LABELS: Record<AffiliationType, string> = {
  rebound_agent: "리바운드 소속 중개사",
  external_agent: "외부 중개사",
  investor: "투자자·건물주",
  general: "일반",
};

export interface Course {
  id: string;
  instructor_id: string;
  title: string;
  subtitle?: string;
  description?: string;
  price: number;
  discount_price?: number;
  thumbnail_url?: string;
  status: "draft" | "review" | "revision" | "approved" | "published" | "archived";
  category: "vacancy" | "brokerage" | "hostel" | "ai_automation" | "investment" | "other";
  total_lectures: number;
  total_duration_sec: number;
  created_at: string;
  instructor?: User;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: "active" | "completed" | "expired" | "refunded";
  progress_pct: number;
  enrolled_at: string;
  completed_at?: string;
  course?: Course;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export const CATEGORIES = [
  { value: "all", label: "전체" },
  { value: "vacancy", label: "공실·사업장" },
  { value: "brokerage", label: "중개업" },
  { value: "hostel", label: "숙박업" },
  { value: "ai_automation", label: "AI자동화" },
  { value: "investment", label: "투자개발" },
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  vacancy: "공실·사업장",
  brokerage: "중개업",
  hostel: "숙박업",
  ai_automation: "AI자동화",
  investment: "투자개발",
  other: "기타",
};

export const ROLE_MENUS: Record<UserRole, NavItem[]> = {
  student: [
    { label: "내 강의실", href: "/student", icon: "BookOpen" },
    { label: "강의 탐색", href: "/student/explore", icon: "Search" },
    { label: "결제 내역", href: "/student/payments", icon: "CreditCard" },
    { label: "Q&A", href: "/student/qna", icon: "MessageSquare" },
    { label: "수료증", href: "/student/certificates", icon: "Award" },
    { label: "의뢰 관리", href: "/student/commissions", icon: "Briefcase" },
  ],
  teacher: [
    { label: "대시보드", href: "/teacher", icon: "LayoutDashboard" },
    { label: "강의 관리", href: "/teacher/courses", icon: "BookOpen" },
    { label: "스케줄", href: "/teacher/schedule", icon: "Calendar" },
    { label: "수강생", href: "/teacher/students", icon: "Users" },
    { label: "Q&A", href: "/teacher/qna", icon: "MessageSquare" },
    { label: "정산", href: "/teacher/settlements", icon: "Wallet" },
    { label: "의뢰 관리", href: "/teacher/commissions", icon: "Briefcase" },
  ],
  staff: [
    { label: "운영 현황", href: "/staff", icon: "LayoutDashboard" },
    { label: "고객 DB", href: "/staff/students", icon: "Users" },
    { label: "전문가 DB", href: "/staff/teachers", icon: "GraduationCap" },
    { label: "CS 상담", href: "/staff/cs", icon: "Headphones" },
    { label: "콘텐츠 검수", href: "/staff/review", icon: "ClipboardCheck" },
    { label: "프로모션", href: "/staff/promotions", icon: "Megaphone" },
    { label: "의뢰 관리", href: "/staff/commissions", icon: "Briefcase" },
  ],
  admin: [
    { label: "대시보드", href: "/admin", icon: "LayoutDashboard" },
    { label: "사용자 관리", href: "/admin/users", icon: "Users" },
    { label: "강의 승인", href: "/admin/approvals", icon: "CheckCircle" },
    { label: "매출·정산", href: "/admin/revenue", icon: "TrendingUp" },
    { label: "설정", href: "/admin/settings", icon: "Settings" },
    { label: "공지", href: "/admin/announcements", icon: "Bell" },
    { label: "의뢰 관리", href: "/admin/commissions", icon: "Briefcase" },
  ],
};

export const ROLE_LABELS: Record<UserRole, string> = {
  student: "고객",
  teacher: "전문가",
  staff: "직원",
  admin: "관리자",
};

export const ROLE_COLORS: Record<UserRole, string> = {
  student: "#228be6",
  teacher: "#20c997",
  staff: "#fab005",
  admin: "#7950f2",
};

// Payment types
export interface Payment {
  id: string;
  user_id: string;
  pg_order_id: string | null;
  pg_payment_key: string | null;
  portone_tx_id: string | null;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  method: "card" | "bank_transfer" | "toss" | "kakao" | "naver" | null;
  status: "pending" | "paid" | "cancelled" | "refunded" | "partial_refund";
  receipt_url: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface PaymentPrepareResponse {
  success: boolean;
  free: boolean;
  orderId?: string;
  orderName?: string;
  totalAmount?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string | null;
  message?: string;
  error?: string;
}

// Commission types
export type CommissionStatus = "requested" | "accepted" | "rejected" | "in_progress" | "completed" | "settled" | "cancelled";
export type ServiceType = "consulting" | "development" | "design" | "marketing" | "filming" | "editing" | "other";

export interface Commission {
  id: string;
  client_id: string;
  expert_id: string;
  course_id: string | null;
  title: string;
  description: string | null;
  service_type: ServiceType;
  estimated_amount: number;
  final_amount: number;
  platform_fee_pct: number;
  platform_fee: number;
  expert_payout: number;
  status: CommissionStatus;
  requested_at: string;
  accepted_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  settled_at: string | null;
  client_memo: string | null;
  expert_memo: string | null;
  admin_memo: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  client?: { id: string; name: string } | null;
  expert?: { id: string; name: string } | null;
  course?: { id: string; title: string } | null;
}

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  consulting: "컨설팅",
  development: "기획/개발",
  design: "디자인",
  marketing: "마케팅",
  filming: "촬영",
  editing: "편집",
  other: "기타",
};

export const COMMISSION_STATUS_MAP: Record<CommissionStatus, { label: string; color: "blue" | "green" | "red" | "amber" | "orange" | "gray" }> = {
  requested: { label: "의뢰 신청", color: "blue" },
  accepted: { label: "수락됨", color: "green" },
  rejected: { label: "거절됨", color: "red" },
  in_progress: { label: "진행 중", color: "orange" },
  completed: { label: "완료", color: "amber" },
  settled: { label: "정산 완료", color: "green" },
  cancelled: { label: "취소", color: "gray" },
};

// Chatbot types
export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

export interface ChatConversation {
  id: string;
  user_id: string;
  title: string;
  course_id: string | null;
  created_at: string;
  updated_at: string;
}
