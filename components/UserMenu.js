"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export default function UserMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sb = getSupabaseBrowser();
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: { subscription } } = sb.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const sb = getSupabaseBrowser();
    if (!sb) return;
    await sb.auth.signOut();
    router.refresh();
    setOpen(false);
  }

  if (!user) {
    const loginHref = `/login?next=${encodeURIComponent(pathname)}`;

    return (
      <Link
        href={loginHref}
        className="hidden rounded-lg px-3.5 py-2 text-[14px] font-semibold text-ink-soft transition-colors hover:text-ink sm:inline-block"
      >
        로그인
      </Link>
    );
  }

  const initials = (user.user_metadata?.full_name || user.email || "U")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="relative hidden sm:block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-[14px] font-black text-white"
        title={user.email}
      >
        {initials}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 min-w-[180px] rounded-xl border border-line bg-paper p-2 shadow-lg">
            <p className="truncate px-3 py-1.5 text-[12px] text-ink-soft">{user.email}</p>
            <hr className="my-1 border-line" />
            <button
              onClick={handleLogout}
              className="w-full rounded-lg px-3 py-2 text-left text-[14px] font-semibold text-ink hover:bg-cream"
            >
              로그아웃
            </button>
          </div>
        </>
      )}
    </div>
  );
}
