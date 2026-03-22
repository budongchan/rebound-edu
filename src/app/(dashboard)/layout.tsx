"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import ChatBot from "@/components/ui/ChatBot";
import type { UserRole, User } from "@/types";

const DEMO_USER: User = {
  id: "demo",
  auth_id: "demo",
  email: "demo@rebound.edu",
  name: "데모 사용자",
  role: "admin",
  is_approved: true,
  is_active: true,
  created_at: new Date().toISOString(),
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!isSupabaseConfigured()) {
        setUser(DEMO_USER);
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        router.push("/auth/login");
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", authUser.id)
        .single();

      if (profile) setUser(profile as User);
      setLoading(false);
    };
    load();
  }, [router]);

  const handleLogout = async () => {
    if (!isSupabaseConfigured()) {
      router.push("/");
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const role = pathname.split("/")[1] as UserRole;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar role={role} userName={user.name} onLogout={handleLogout} />
      <div className="flex-1 ml-0 flex flex-col min-w-0">
        <Header role={role} />
        <main className="flex-1 p-4 md:p-6 overflow-auto pt-16 md:pt-6">
          <div className="max-w-[960px]">{children}</div>
        </main>
      </div>
      <ChatBot userId={user.id} />
    </div>
  );
}
