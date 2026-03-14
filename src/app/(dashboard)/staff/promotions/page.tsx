"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Badge from "@/components/ui/Badge";
import { formatPrice, formatDate } from "@/lib/utils";
import { Plus, X, Megaphone, Trash2 } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  name: string;
  discount_type: string;
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export default function StaffPromotionsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("percentage");
  const [formValue, setFormValue] = useState("");
  const [formMaxUses, setFormMaxUses] = useState("");
  const [formExpiry, setFormExpiry] = useState("");
  const [formSaving, setFormSaving] = useState(false);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("coupons")
      .select("id, code, name, discount_type, discount_value, max_uses, used_count, is_active, expires_at, created_at")
      .order("created_at", { ascending: false });

    setCoupons(data || []);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!formCode.trim() || !formName.trim() || !formValue) return;
    setFormSaving(true);

    const supabase = createClient();
    await supabase.from("coupons").insert({
      code: formCode.trim().toUpperCase(),
      name: formName.trim(),
      discount_type: formType,
      discount_value: parseInt(formValue),
      max_uses: formMaxUses ? parseInt(formMaxUses) : null,
      expires_at: formExpiry || null,
      is_active: true,
    });

    setShowModal(false);
    resetForm();
    setFormSaving(false);
    await loadCoupons();
  };

  const resetForm = () => {
    setFormCode("");
    setFormName("");
    setFormType("percentage");
    setFormValue("");
    setFormMaxUses("");
    setFormExpiry("");
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    const supabase = createClient();
    await supabase.from("coupons").update({ is_active: !isActive }).eq("id", id);
    setCoupons(coupons.map((c) => (c.id === id ? { ...c, is_active: !isActive } : c)));
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    await supabase.from("coupons").delete().eq("id", id);
    setCoupons(coupons.filter((c) => c.id !== id));
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

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
        <h2 className="text-base font-bold">프로모션</h2>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-dark transition"
        >
          <Plus size={16} /> 쿠폰 생성
        </button>
      </div>

      {coupons.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
          <Megaphone className="mx-auto mb-3 text-gray-300" size={40} />
          <p className="text-gray-400 mb-1">쿠폰이 없습니다</p>
          <p className="text-sm text-gray-300">새 쿠폰을 생성해보세요</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">쿠폰</th>
                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">코드</th>
                <th className="text-center text-xs text-gray-500 font-medium px-4 py-3">할인</th>
                <th className="text-center text-xs text-gray-500 font-medium px-4 py-3">사용</th>
                <th className="text-center text-xs text-gray-500 font-medium px-4 py-3">상태</th>
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">관리</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => {
                const expired = isExpired(c.expires_at);
                const exhausted = c.max_uses !== null && c.used_count >= c.max_uses;
                return (
                  <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{c.name}</p>
                      {c.expires_at && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          만료: {formatDate(c.expires_at)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">{c.code}</code>
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-semibold text-brand">
                      {c.discount_type === "percentage" ? `${c.discount_value}%` : `₩${formatPrice(c.discount_value)}`}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                      {c.used_count}{c.max_uses !== null ? `/${c.max_uses}` : ""}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {expired ? (
                        <Badge color="gray">만료</Badge>
                      ) : exhausted ? (
                        <Badge color="gray">소진</Badge>
                      ) : c.is_active ? (
                        <Badge color="green">활성</Badge>
                      ) : (
                        <Badge color="gray">비활성</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggle(c.id, c.is_active)}
                          className="px-2 py-1 text-xs text-gray-400 border border-gray-200 rounded hover:bg-gray-50 transition"
                        >
                          {c.is_active ? "비활성" : "활성"}
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1 text-gray-300 hover:text-red-400 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-[420px] p-6 mx-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold">쿠폰 생성</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">쿠폰 이름 *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="얼리버드 30% 할인"
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">쿠폰 코드 *</label>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  placeholder="EARLY30"
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand font-mono uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">할인 유형</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand bg-white"
                  >
                    <option value="percentage">퍼센트 (%)</option>
                    <option value="fixed">정액 (원)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">할인 값 *</label>
                  <input
                    type="number"
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    placeholder={formType === "percentage" ? "30" : "10000"}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">최대 사용 수</label>
                  <input
                    type="number"
                    value={formMaxUses}
                    onChange={(e) => setFormMaxUses(e.target.value)}
                    placeholder="무제한"
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">만료일</label>
                  <input
                    type="date"
                    value={formExpiry}
                    onChange={(e) => setFormExpiry(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleCreate}
                disabled={formSaving || !formCode.trim() || !formName.trim() || !formValue}
                className="px-4 py-2 text-sm font-semibold text-white bg-brand rounded-lg hover:bg-brand-dark disabled:opacity-50"
              >
                {formSaving ? "생성 중..." : "생성"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
