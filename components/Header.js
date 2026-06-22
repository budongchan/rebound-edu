import Link from "next/link";
import { MENU_CATEGORIES } from "@/lib/courses";
import UserMenu from "@/components/UserMenu";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white">
      <div className="container-edu flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-[13px] font-black leading-none text-white"
            aria-label="REBOUND EDU"
          >
            RE
          </span>
          <span className="text-[17px] font-extrabold tracking-tight text-ink">
            리바운드 <span className="text-brand">에듀</span>
          </span>
        </Link>

        {/* 수업 분류 메뉴 */}
        <nav className="hidden items-center gap-1 md:flex">
          {MENU_CATEGORIES.map((cat) => (
            <Link
              key={cat.key}
              href={`/subjects/${cat.key}`}
              className="rounded-lg px-3 py-2 text-[15px] font-semibold text-ink-soft transition-colors hover:bg-cream hover:text-ink"
            >
              {cat.label}
            </Link>
          ))}
          <span className="mx-1 h-4 w-px bg-line" />
          <Link href="/#faq" className="rounded-lg px-3 py-2 text-[15px] font-semibold text-ink-soft transition-colors hover:text-ink">
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="http://pf.kakao.com/_HCYmn/chat"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-lg border border-[#FEE500] bg-[#FEE500] px-3 py-2 text-[14px] font-bold text-[#3B1E08] transition-opacity hover:opacity-80 md:flex"
          >
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M9 1C4.58172 1 1 3.91015 1 7.5C1 9.80721 2.39052 11.8405 4.5 13.0145L3.75 16.5L7.66667 14.3333C8.10417 14.3889 8.54861 14.4167 9 14.4167C13.4183 14.4167 17 11.5065 17 7.91667C17 4.32682 13.4183 1 9 1Z" fill="#3B1E08"/>
            </svg>
            카톡 문의
          </a>
          <UserMenu />
          <Link
            href="/courses"
            className="rounded-lg bg-ink px-4 py-2 text-[14px] font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            전체 강의
          </Link>
        </div>
      </div>

      {/* 모바일 분류 바 */}
      <div className="border-t border-line md:hidden">
        <nav className="container-edu flex gap-1 overflow-x-auto py-2 [&::-webkit-scrollbar]:hidden">
          <a
            href="http://pf.kakao.com/_HCYmn/chat"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 whitespace-nowrap rounded-lg bg-[#FEE500] px-3 py-1.5 text-[13px] font-bold text-[#3B1E08]"
          >
            카톡 문의
          </a>
          <Link
            href="/courses"
            className="shrink-0 whitespace-nowrap rounded-lg bg-ink px-3 py-1.5 text-[13px] font-bold text-white"
          >
            전체 강의
          </Link>
          {MENU_CATEGORIES.map((cat) => (
            <Link
              key={cat.key}
              href={`/subjects/${cat.key}`}
              className="shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-[14px] font-semibold text-ink-soft hover:text-ink"
            >
              {cat.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
