"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, formatDate } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import { TrendingUp, CreditCard, Wallet } from "lucide-react";

interface PaymentRow {
  id: string;
  userName: string;
  final_amount: number;
  status: string;
  method: string | null;
  paid_at: string | null;
  created_at: string;
}

interface SettlementRow {
  id: string;
  instructorName: string;
  period_year: number;
  period_month: number;
  total_revenue: number;
  platform_fee: number;
  net_amount: number;
  status: string;
}

const PAY_STATUS: Record<string, { label: string; color: "green" | "amber" | "gray" | "red" | "orange" }> = {
  paid: { label: "결제완료", color: "green" },
  pending: { label: "대기", color: "amber" },
  cancelled: { label: "취소", color: "gray" },
  refunded: { label: "환불", color: "red" },
  partial_refund: { label: "부분환불", color: "orange" },
};

const SETTLE_STATUS: Record<string, { label: string; color: "green" | "blue" | "amber" }> = {
  pending: { label: "대기", color: "amber" },
  confirmed: { label: "확인", color: "blue" },
  paid: { label: "지급완료", color: "green" },
};

export default function AdminRevenuePage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [settlements, setSettlements] = useState<SettlementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"payments" | "settlements">("payments");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();

      // Payments
      const { data: pays } = await supabase
        .from("payments")
        .select("id, final_amount, status, method, paid_at, created_at, user:users!payments_user_id_fkey(name)")
        .order("created_at", { ascending: false })
        .limit(50);

      setPayments((pays || []).map((p) => {
        const rawUser = p.user as { name: string } | { name: string }[] | null;
        const u = Array.isArray(rawUser) ? rawUser[0] : rawUser;
        return { ...p, userName: u?.name || "사용자" };
      }));

      // Settlements
      const { data: settles } = await supabase
        .from("settlements")
        .select("id, period_year, period_month, total_revenue, platform_fee, net_amount, status, instructor:users!settlements_instructor_id_fkey(name)")
        .order("period_year", { ascending: false })
        .order("period_month", { ascending: false })
        .limit(50);

      setSettlements((settles || []).map((s) => {
        const rawInst = s.instructor as { name: string } | { name: string }[] | null;
        const inst = Array.isArray(rawInst) ? rawInst[0] : rawInst;
        return { ...s, instructorName: inst?.name || "강사" };
      }));

      setLoading(false);
    };
    load();
  }, []);

  const handleSettlementAction = async (id: string, newStatus: string) => {
    const supabase = createClient();
    const update: Record<string, unknown> = { status: newStatus };
    if (newStatus === "paid") update.settled_at = new Date().toISOString();
    await supabase.from("settlements").update(update).eq("id", id);
    setSettlements(settlements.map((s) => (s.id === id ? { ...s, status: newStatus } : s)));
  };

  // Stats
  const totalPaid = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.final_amount, 0);
  const totalSettled = settlements.filter((s) => s.status === "paid").reduce((s, r) => s + r.net_amount, 0);
  const pendingSettle = settlements.filter((s) => s.status !== "paid").reduce((s, r) => s + r.net_amount, 0);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <h2 className="text-base font-bold mb-5">매출 · 정산</h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-lg border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-brand" />
            <p className="text-xs text-gray-500 font-medium">총 매출</p>
          </div>
          <p className="text-xl font-bold text-gray-900">₩{formatPrice(totalPaid)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={16} className="text-green-600" />
            <p className="text-xs text-gray-500 font-medium">지급 완료</p>
          </div>
          <p className="text-xl font-bold text-green-600">₩{formatPrice(totalSettled)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard size={16} className="text-amber-600" />
            <p className="text-xs text-gray-500 font-medium">미지급</p>
          </div>
          <p className="text-xl font-bold text-amber-600">₩{formatPrice(pendingSettle)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("payments")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            tab === "payments" ? "bg-brand text-white" : "bg-white text-gray-600 border border-gray-200"
          }`}
        >
          결제 내역 ({payments.length})
        </button>
        <button
          onClick={() => setTab("settlements")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            tab === "settlements" ? "bg-brand text-white" : "bg-white text-gray-600 border border-gray-200"
          }`}
        >
          교사 정산 ({settlements.length})
        </button>
      </div>

      {/* Payments tab */}
      {tab === "payments" && (
        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
          {payments.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-400">결제 내역이 없습니다</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">사용자</th>
                  <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">금액</th>
                  <th className="text-center text-xs text-gray-500 font-medium px-4 py-3">상태</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">날짜</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const st = PAY_STATUS[p.status] || PAY_STATUS.pending;
                  return (
                    <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.userName}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                        ₩{formatPrice(p.final_amount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge color={st.color}>{st.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {formatDate(p.paid_at || p.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Settlements tab */}
      {tab === "settlements" && (
        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
          {settlements.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-400">정산 내역이 없습니다</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">교사</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">기간</th>
                  <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">매출</th>
                  <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">수수료</th>
                  <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">정산액</th>
                  <th className="text-center text-xs text-gray-500 font-medium px-4 py-3">상태</th>
                  <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">관리</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map((s) => {
                  const st = SETTLE_STATUS[s.status] || SETTLE_STATUS.pending;
                  return (
                    <tr key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.instructorName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{s.period_year}.{String(s.period_month).padStart(2, "0")}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-700">₩{formatPrice(s.total_revenue)}</td>
                      <td className="px-4 py-3 text-right text-sm text-red-500">-₩{formatPrice(s.platform_fee)}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">₩{formatPrice(s.net_amount)}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge color={st.color}>{st.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {s.status === "pending" && (
                          <button
                            onClick={() => handleSettlementAction(s.id, "confirmed")}
                            className="px-2.5 py-1 text-xs font-semibold text-brand border border-brand rounded hover:bg-brand hover:text-white transition"
                          >
                            확인
                          </button>
                        )}
                        {s.status === "confirmed" && (
                          <button
                            onClick={() => handleSettlementAction(s.id, "paid")}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-green-500 rounded hover:bg-green-600 transition"
                          >
                            지급
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </>
  );
}
