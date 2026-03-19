"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { COMMISSION_STATUS_MAP, SERVICE_TYPE_LABELS } from "@/types";
import type { Commission, CommissionStatus } from "@/types";
import Badge from "@/components/ui/Badge";
import StatCard from "@/components/ui/StatCard";
import { formatPrice, formatDate } from "@/lib/utils";
import { Briefcase, Search, DollarSign, CheckCircle } from "lucide-react";

const FILTER_TABS: { label: string; value: string }[] = [
  { label: "전체", value: "all" },
  { label: "신규", value: "requested" },
  { label: "진행중", value: "active" },
  { label: "정산 대기", value: "completed" },
  { label: "정산 완료", value: "settled" },
];

export default function StaffCommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  // 정산 모달
  const [settlingId, setSettlingId] = useState<string | null>(null);
  const [settlingCommission, setSettlingCommission] = useState<Commission | null>(null);
  const [adminMemo, setAdminMemo] = useState("");

  const loadData = async () => {
    const supabase = createClient();

    const { data } = await supabase
      .from("commissions")
      .select(`
        *,
        client:users!commissions_client_id_fkey(id, name),
        expert:users!commissions_expert_id_fkey(id, name),
        course:courses!commissions_course_id_fkey(id, title)
      `)
      .order("created_at", { ascending: false });

    const list = (data || []).map((c) => ({
      ...c,
      client: Array.isArray(c.client) ? c.client[0] : c.client,
      expert: Array.isArray(c.expert) ? c.expert[0] : c.expert,
      course: Array.isArray(c.course) ? c.course[0] : c.course,
    }));
    setCommissions(list);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSettle = async () => {
    if (!settlingId || !settlingCommission) return;

    const supabase = createClient();
    const feePct = settlingCommission.platform_fee_pct || 10;
    const finalAmount = settlingCommission.final_amount;
    const platformFee = Math.round(finalAmount * feePct / 100);
    const expertPayout = finalAmount - platformFee;

    const { error } = await supabase
      .from("commissions")
      .update({
        status: "settled",
        platform_fee: platformFee,
        expert_payout: expertPayout,
        settled_at: new Date().toISOString(),
        admin_memo: adminMemo.trim() || settlingCommission.admin_memo || null,
      })
      .eq("id", settlingId);

    if (error) {
      alert("정산 처리에 실패했습니다.");
      console.error(error);
    } else {
      setSettlingId(null);
      setSettlingCommission(null);
      setAdminMemo("");
      await loadData();
    }
  };

  // Stats
  const totalCount = commissions.length;
  const activeCount = commissions.filter((c) => ["accepted", "in_progress"].includes(c.status)).length;
  const pendingSettlement = commissions.filter((c) => c.status === "completed").length;
  const totalFee = commissions
    .filter((c) => c.status === "settled")
    .reduce((s, c) => s + c.platform_fee, 0);

  // Filtering
  const filtered = commissions
    .filter((c) => {
      if (filter === "requested") return c.status === "requested";
      if (filter === "active") return ["accepted", "in_progress"].includes(c.status);
      if (filter === "completed") return c.status === "completed";
      if (filter === "settled") return c.status === "settled";
      return true;
    })
    .filter((c) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.client?.name?.toLowerCase().includes(q) ||
        c.expert?.name?.toLowerCase().includes(q)
      );
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
      <h2 className="text-base font-bold mb-5">의뢰 관리</h2>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <StatCard label="총 의뢰" value={totalCount} />
        <StatCard label="진행 중" value={activeCount} accent="#f97316" />
        <StatCard label="정산 대기" value={pendingSettlement} accent="#f59e0b" />
        <StatCard label="총 수수료 수익" value={`₩${formatPrice(totalFee)}`} accent="#22c55e" />
      </div>

      {/* Search + Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="의뢰 제목, 의뢰인, 전문가 검색..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
          />
        </div>
      </div>

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

      {/* Commission table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
          <Briefcase className="mx-auto mb-3 text-gray-300" size={40} />
          <p className="text-gray-400">의뢰가 없습니다</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">의뢰</th>
                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">의뢰인</th>
                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">전문가</th>
                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">유형</th>
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">금액</th>
                <th className="text-center text-xs text-gray-500 font-medium px-4 py-3">상태</th>
                <th className="text-center text-xs text-gray-500 font-medium px-4 py-3">액션</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const st = COMMISSION_STATUS_MAP[c.status];
                return (
                  <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                        {c.title}
                      </p>
                      <p className="text-xs text-gray-400">{formatDate(c.requested_at)}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {c.client?.name || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {c.expert?.name || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {SERVICE_TYPE_LABELS[c.service_type] || c.service_type}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {c.final_amount > 0 ? (
                        <span className="text-sm font-semibold text-gray-900">
                          ₩{formatPrice(c.final_amount)}
                        </span>
                      ) : c.estimated_amount > 0 ? (
                        <span className="text-sm text-gray-400">
                          ~₩{formatPrice(c.estimated_amount)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge color={st.color}>{st.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.status === "completed" && (
                        <button
                          onClick={() => {
                            setSettlingId(c.id);
                            setSettlingCommission(c);
                            setAdminMemo(c.admin_memo || "");
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-semibold hover:bg-green-600 transition mx-auto"
                        >
                          <DollarSign size={13} />
                          정산
                        </button>
                      )}
                      {c.status === "settled" && (
                        <span className="text-xs text-green-600 font-medium">
                          ₩{formatPrice(c.platform_fee)} 수수료
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 정산 모달 */}
      {settlingId && settlingCommission && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">정산 처리</h3>

            <div className="space-y-3 mb-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">의뢰 제목</span>
                  <span className="font-medium text-gray-900">{settlingCommission.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">확정 금액</span>
                  <span className="font-bold text-gray-900">₩{formatPrice(settlingCommission.final_amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">수수료율</span>
                  <span className="text-gray-700">{settlingCommission.platform_fee_pct}%</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between text-sm">
                  <span className="text-gray-500">플랫폼 수수료</span>
                  <span className="font-semibold text-red-500">
                    ₩{formatPrice(Math.round(settlingCommission.final_amount * settlingCommission.platform_fee_pct / 100))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">전문가 지급액</span>
                  <span className="font-bold text-green-600">
                    ₩{formatPrice(settlingCommission.final_amount - Math.round(settlingCommission.final_amount * settlingCommission.platform_fee_pct / 100))}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  관리자 메모 (선택)
                </label>
                <textarea
                  value={adminMemo}
                  onChange={(e) => setAdminMemo(e.target.value)}
                  placeholder="정산 관련 메모를 입력하세요"
                  rows={2}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSettlingId(null);
                  setSettlingCommission(null);
                  setAdminMemo("");
                }}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition"
              >
                취소
              </button>
              <button
                onClick={handleSettle}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition"
              >
                <CheckCircle size={16} />
                정산 완료
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
