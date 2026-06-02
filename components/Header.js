import Link from "next/link";
import { MENU_CATEGORIES } from "@/lib/courses";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/85 backdrop-blur">
      <div className="container-edu flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-base font-black text-white">
            R
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
          <Link
            href="/login"
            className="hidden rounded-lg px-3.5 py-2 text-[14px] font-semibold text-ink-soft transition-colors hover:text-ink sm:inline-block"
          >
            로그인
          </Link>
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
        <nav className="container-edu flex gap-1 overflow-x-auto py-2">
          {MENU_CATEGORIES.map((cat) => (
            <Link
              key={cat.key}
              href={`/subjects/${cat.key}`}
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-[14px] font-semibold text-ink-soft hover:text-ink"
            >
              {cat.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
