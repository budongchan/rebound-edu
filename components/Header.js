import Link from "next/link";

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

        <nav className="hidden items-center gap-7 text-[15px] font-semibold text-ink-soft md:flex">
          <Link href="/courses" className="transition-colors hover:text-ink">강의</Link>
          <Link href="/#faq" className="transition-colors hover:text-ink">FAQ</Link>
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
            시작하기
          </Link>
        </div>
      </div>
    </header>
  );
}
