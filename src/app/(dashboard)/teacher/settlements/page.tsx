"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Badge from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { Wallet, TrendingUp, CreditCard } from "lucide-react";

interface Settlement {
  id: string;
  period_year: number;
  period_month: number;
  total_revenue: number;
  platform_fee: number;
  net_amount: number;
  status: string;
  settled_at: string | null;
}

interface MonthlyStat {
  month: string;
  revenue: number;
  fee: number;
  net: number;
}

const STATUS_MAP: Record<string, { label: string; color: "green" | "blue" | "amber" | "gray" }> = {
  pending: { label: "정산 대기", color: "amber" },
  confirmed: { label: "확인됨", color: "blue" },
  paid: { label: "지급 완료", color: "green" },
};

export default function TeacherSettlementsPage() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalNet, setTotalNet] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profile } = await supabase
        .from("users").select("id").eq("auth_id", user.id).single();
      if (!profile) { setLoading(false); return; }

      const { data } = await supabase
        .from("settlements")
        .select("*")
        .eq("instructor_id", profile.id)
        .order("period_year", { ascending: false })
        .order("period_month", { ascending: false });

      const list = data || [];
      setSettlements(list);

      const rev = list.reduce((s, r) => s + r.total_revenue, 0);
      const net = list.reduce((s, r) => s + r.net_amount, 0);
      const pending = list
        .filter((r) => r.status !== "paid")
        .reduce((s, r) => s + r.net_amount, 0);

      setTotalRevenue(rev);
      setTotalNet(net);
      setPendingAmount(pending);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <h2 className="text-base font-bold mb-5">정산</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-lg border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-brand" />
            <p className="text-xs text-gray-500 font-medium">총 매출</p>
          </div>
          <p className="text-xl font-bold text-gray-900">₩{formatPrice(totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={16} className="text-green-600" />
            <p className="text-xs text-gray-500 font-medium">총 정산액</p>
          </div>
          <p className="text-xl font-bold text-green-600">₩{formatPrice(totalNet)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard size={16} className="text-amber-600" />
            <p className="text-xs text-gray-500 font-medium">미지급 잔액</p>
          </div>
          <p className="text-xl font-bold text-amber-600">₩{formatPrice(pendingAmount)}</p>
        </div>
      </div>

      {/* Settlement history */}
      {settlements.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
          <Wallet className="mx-auto mb-3 text-gray-300" size={40} />
          <p className="text-gray-400 mb-1">정산 내역이 없습니다</p>
          <p className="text-sm text-gray-300">강의 매출이 발생하면 여기에 표시됩니다</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">정산 기간</th>
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">매출</th>
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">수수료</th>
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">정산액</th>
                <th className="text-center text-xs text-gray-500 font-medium px-4 py-3">상태</th>
              </tr>
            </thead>
            <tbody>
              {settlements.map((s) => {
                const st = STATUS_MAP[s.status] || STATUS_MAP.pending;
                return (
                  <tr key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">
                        {s.period_year}년 {s.period_month}월
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-gray-700">₩{formatPrice(s.total_revenue)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-red-500">-₩{formatPrice(s.platform_fee)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold text-gray-900">₩{formatPrice(s.net_amount)}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge color={st.color}>{st.label}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Info note */}
      <div className="mt-4 bg-gray-50 rounded-lg p-4">
        <p className="text-xs text-gray-500 leading-relaxed">
          정산은 매월 1일 기준으로 전월 매출을 집계합니다. 수수료율은 강의별 설정에 따라 다를 수 있습니다.
          정산금은 확인 후 영업일 기준 3~5일 이내에 등록된 계좌로 입금됩니다.
        </p>
      </div>
    </>
  );
}
