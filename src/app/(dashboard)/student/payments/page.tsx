"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Badge from "@/components/ui/Badge";
import { formatPrice, formatDate } from "@/lib/utils";
import { CreditCard } from "lucide-react";

interface PaymentItem {
  id: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  method: string | null;
  status: string;
  paid_at: string | null;
  created_at: string;
}

const STATUS_MAP: Record<string, { label: string; color: "green" | "blue" | "gray" | "red" | "orange" }> = {
  pending: { label: "결제 대기", color: "blue" },
  paid: { label: "결제 완료", color: "green" },
  cancelled: { label: "취소", color: "gray" },
  refunded: { label: "환불", color: "red" },
  partial_refund: { label: "부분환불", color: "orange" },
};

const METHOD_LABELS: Record<string, string> = {
  card: "카드",
  bank_transfer: "계좌이체",
  toss: "토스페이",
  kakao: "카카오페이",
  naver: "네이버페이",
};

export default function StudentPaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profile } = await supabase
        .from("users").select("id").eq("auth_id", user.id).single();
      if (!profile) { setLoading(false); return; }

      const { data } = await supabase
        .from("payments")
        .select("id, total_amount, discount_amount, final_amount, method, status, paid_at, created_at")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });

      setPayments(data || []);
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
      <h2 className="text-base font-bold mb-5">결제 내역</h2>

      {payments.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
          <CreditCard className="mx-auto mb-3 text-gray-300" size={40} />
          <p className="text-gray-400 mb-1">결제 내역이 없습니다</p>
          <p className="text-sm text-gray-300">강의를 수강 신청하면 여기에 표시됩니다</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {payments.map((p) => {
            const st = STATUS_MAP[p.status] || STATUS_MAP.pending;
            return (
              <div
                key={p.id}
                className="bg-white rounded-lg border border-gray-100 p-5"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-[15px] font-semibold text-gray-900">
                      ₩{formatPrice(p.final_amount)}
                    </p>
                    {p.discount_amount > 0 && (
                      <p className="text-xs text-gray-400">
                        정가 ₩{formatPrice(p.total_amount)} / 할인 -₩{formatPrice(p.discount_amount)}
                      </p>
                    )}
                  </div>
                  <Badge color={st.color}>{st.label}</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  {p.method && <span>{METHOD_LABELS[p.method] || p.method}</span>}
                  <span>·</span>
                  <span>{formatDate(p.paid_at || p.created_at)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
