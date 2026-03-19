"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { COMMISSION_STATUS_MAP, SERVICE_TYPE_LABELS } from "@/types";
import type { Commission, CommissionStatus } from "@/types";
import Badge from "@/components/ui/Badge";
import { formatPrice, formatDate } from "@/lib/utils";
import { Briefcase, Check, X, Play, CheckCircle } from "lucide-react";

const FILTER_TABS: { label: string; value: string }[] = [
  { label: "전체", value: "all" },
  { label: "신규 의뢰", value: "requested" },
  { label: "진행중", value: "active" },
  { label: "완료/정산", value: "done" },
];

export default function TeacherCommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [profileId, setProfileId] = useState<string>("");
  // 수락 모달
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [quoteAmount, setQuoteAmount] = useState("");
  const [expertMemo, setExpertMemo] = useState("");

  const loadData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: profile } = await supabase
      .from("users").select("id").eq("auth_id", user.id).single();
    if (!profile) { setLoading(false); return; }
    setProfileId(profile.id);

    const { data } = await supabase
      .from("commissions")
      .select(`
        *,
        client:users!commissions_client_id_fkey(id, name),
        course:courses!commissions_course_id_fkey(id, title)
      `)
      .eq("expert_id", profile.id)
      .order("created_at", { ascending: false });

    const list = (data || []).map((c) => ({
      ...c,
      client: Array.isArray(c.client) ? c.client[0] : c.client,
      course: Array.isArray(c.course) ? c.course[0] : c.course,
    }));
    setCommissions(list);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const updateStatus = async (
    id: string,
    status: CommissionStatus,
    extra: Record<string, unknown> = {}
  ) => {
    const supabase = createClient();
    const timestampField: Record<string, string> = {
      accepted: "accepted_at",
      rejected: "accepted_at",
      in_progress: "started_at",
      completed: "completed_at",
    };

    const updates: Record<string, unknown> = { status, ...extra };
    if (timestampField[status]) {
      updates[timestampField[status]] = new Date().toISOString();
    }

    const { error } = await supabase
      .from("commissions")
      .update(updates)
      .eq("id", id);

    if (error) {
      alert("상태 변경에 실패했습니다.");
      console.error(error);
    } else {
      await loadData();
    }
  };

  const handleAccept = async () => {
    if (!acceptingId) return;
    await updateStatus(acceptingId, "accepted", {
      final_amount: parseInt(quoteAmount) || 0,
      expert_memo: expertMemo.trim() || null,
    });
    setAcceptingId(null);
    setQuoteAmount("");
    setExpertMemo("");
  };

  const filtered = commissions.filter((c) => {
    if (filter === "requested") return c.status === "requested";
    if (filter === "active") return ["accepted", "in_progress"].includes(c.status);
    if (filter === "done") return ["completed", "settled"].includes(c.status);
    return true;
  });

  const requestedCount = commissions.filter((c) => c.status === "requested").length;

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
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold">의뢰 관리</h2>
          {requestedCount > 0 && (
            <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
              {requestedCount}
            </span>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-lg border border-gray-100 p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">총 의뢰</p>
          <p className="text-lg font-bold text-gray-900">{commissions.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">신규</p>
          <p className="text-lg font-bold text-blue-600">{requestedCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">진행 중</p>
          <p className="text-lg font-bold text-orange-600">
            {commissions.filter((c) => ["accepted", "in_progress"].includes(c.status)).length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">완료</p>
          <p className="text-lg font-bold text-green-600">
            {commissions.filter((c) => ["completed", "settled"].includes(c.status)).length}
          </p>
        </div>
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
          <p className="text-gray-400 mb-1">의뢰가 없습니다</p>
          <p className="text-sm text-gray-300">수강생이 의뢰를 신청하면 여기에 표시됩니다</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((c) => {
            const st = COMMISSION_STATUS_MAP[c.status];
            return (
              <div
                key={c.id}
                className="bg-white rounded-lg border border-gray-100 p-5"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-semibold text-gray-900 mb-1 truncate">
                      {c.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[13px] text-gray-500 flex-wrap">
                      <span>의뢰인: {c.client?.name || "수강생"}</span>
                      <span className="text-gray-300">·</span>
                      <span>{SERVICE_TYPE_LABELS[c.service_type] || c.service_type}</span>
                      {c.course && (
                        <>
                          <span className="text-gray-300">·</span>
                          <span className="truncate max-w-[150px]">{c.course.title}</span>
                        </>
                      )}
                    </div>
                    {c.description && (
                      <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">{c.description}</p>
                    )}
                    {c.client_memo && (
                      <p className="text-xs text-blue-500 mt-1 bg-blue-50 px-2 py-1 rounded">
                        메모: {c.client_memo}
                      </p>
                    )}
                  </div>
                  <Badge color={st.color}>{st.label}</Badge>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-gray-50">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{formatDate(c.requested_at)}</span>
                    {c.estimated_amount > 0 && (
                      <span>희망 예산: ₩{formatPrice(c.estimated_amount)}</span>
                    )}
                    {c.final_amount > 0 && (
                      <span className="font-semibold text-gray-700">
                        확정: ₩{formatPrice(c.final_amount)}
                      </span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    {c.status === "requested" && (
                      <>
                        <button
                          onClick={() => {
                            setAcceptingId(c.id);
                            setQuoteAmount(c.estimated_amount > 0 ? c.estimated_amount.toString() : "");
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-semibold hover:bg-green-600 transition"
                        >
                          <Check size={14} />
                          수락
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("이 의뢰를 거절하시겠습니까?")) {
                              updateStatus(c.id, "rejected");
                            }
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-300 transition"
                        >
                          <X size={14} />
                          거절
                        </button>
                      </>
                    )}
                    {c.status === "accepted" && (
                      <button
                        onClick={() => updateStatus(c.id, "in_progress")}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition"
                      >
                        <Play size={14} />
                        작업 시작
                      </button>
                    )}
                    {c.status === "in_progress" && (
                      <button
                        onClick={() => {
                          if (confirm("작업을 완료 처리하시겠습니까?")) {
                            updateStatus(c.id, "completed");
                          }
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand-dark transition"
                      >
                        <CheckCircle size={14} />
                        작업 완료
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 수락 모달 */}
      {acceptingId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">의뢰 수락</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  견적 금액 (원) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={quoteAmount}
                  onChange={(e) => setQuoteAmount(e.target.value)}
                  placeholder="최종 확정 금액을 입력하세요"
                  min="0"
                  step="10000"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  메모 (선택)
                </label>
                <textarea
                  value={expertMemo}
                  onChange={(e) => setExpertMemo(e.target.value)}
                  placeholder="의뢰인에게 전달할 메모"
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => {
                  setAcceptingId(null);
                  setQuoteAmount("");
                  setExpertMemo("");
                }}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition"
              >
                취소
              </button>
              <button
                onClick={handleAccept}
                disabled={!quoteAmount || parseInt(quoteAmount) <= 0}
                className="flex-1 px-4 py-2.5 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition disabled:opacity-50"
              >
                수락 확정
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
