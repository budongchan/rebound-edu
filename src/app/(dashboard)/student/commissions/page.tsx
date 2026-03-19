"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { COMMISSION_STATUS_MAP, SERVICE_TYPE_LABELS } from "@/types";
import type { Commission, CommissionStatus } from "@/types";
import Badge from "@/components/ui/Badge";
import { formatPrice, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Briefcase, Plus, Search } from "lucide-react";

const FILTER_TABS: { label: string; value: string }[] = [
  { label: "전체", value: "all" },
  { label: "진행중", value: "active" },
  { label: "완료/정산", value: "done" },
  { label: "취소/거절", value: "closed" },
];

const ACTIVE_STATUSES: CommissionStatus[] = ["requested", "accepted", "in_progress"];
const DONE_STATUSES: CommissionStatus[] = ["completed", "settled"];
const CLOSED_STATUSES: CommissionStatus[] = ["rejected", "cancelled"];

export default function StudentCommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profile } = await supabase
        .from("users").select("id").eq("auth_id", user.id).single();
      if (!profile) { setLoading(false); return; }

      const { data } = await supabase
        .from("commissions")
        .select(`
          *,
          expert:users!commissions_expert_id_fkey(id, name),
          course:courses!commissions_course_id_fkey(id, title)
        `)
        .eq("client_id", profile.id)
        .order("created_at", { ascending: false });

      const list = (data || []).map((c) => ({
        ...c,
        expert: Array.isArray(c.expert) ? c.expert[0] : c.expert,
        course: Array.isArray(c.course) ? c.course[0] : c.course,
      }));
      setCommissions(list);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = commissions.filter((c) => {
    if (filter === "active") return ACTIVE_STATUSES.includes(c.status);
    if (filter === "done") return DONE_STATUSES.includes(c.status);
    if (filter === "closed") return CLOSED_STATUSES.includes(c.status);
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold">의뢰 관리</h2>
        <Link
          href="/student/commissions/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-dark transition"
        >
          <Plus size={16} />
          새 의뢰 신청
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-4">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              filter === tab.value
                ? "bg-brand text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Commission list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
          <Briefcase className="mx-auto mb-3 text-gray-300" size={40} />
          <p className="text-gray-400 mb-1">
            {filter === "all" ? "의뢰 내역이 없습니다" : "해당 상태의 의뢰가 없습니다"}
          </p>
          <p className="text-sm text-gray-300">
            전문가에게 의뢰를 신청해보세요
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((c) => {
            const st = COMMISSION_STATUS_MAP[c.status];
            return (
              <div
                key={c.id}
                className="bg-white rounded-lg border border-gray-100 p-5 hover:border-gray-300 transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-semibold text-gray-900 mb-1 truncate">
                      {c.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[13px] text-gray-500 flex-wrap">
                      <span>{c.expert?.name || "전문가"}</span>
                      <span className="text-gray-300">·</span>
                      <span>{SERVICE_TYPE_LABELS[c.service_type] || c.service_type}</span>
                      {c.course && (
                        <>
                          <span className="text-gray-300">·</span>
                          <span className="truncate max-w-[150px]">{c.course.title}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge color={st.color}>{st.label}</Badge>
                </div>
                <div className="flex items-center justify-between pt-2.5 border-t border-gray-50">
                  <span className="text-xs text-gray-400">
                    {formatDate(c.requested_at)}
                  </span>
                  <div className="flex items-center gap-2">
                    {c.estimated_amount > 0 && (
                      <span className="text-xs text-gray-400">
                        희망 예산: ₩{formatPrice(c.estimated_amount)}
                      </span>
                    )}
                    {c.final_amount > 0 && (
                      <span className="text-sm font-semibold text-gray-900">
                        ₩{formatPrice(c.final_amount)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
