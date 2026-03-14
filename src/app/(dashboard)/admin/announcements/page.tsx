"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { Plus, X, Bell, Trash2, Pin } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  is_pinned: boolean;
  is_active: boolean;
  created_at: string;
}

const TYPE_MAP: Record<string, { label: string; color: "blue" | "green" | "amber" }> = {
  notice: { label: "공지", color: "blue" },
  banner: { label: "배너", color: "green" },
  popup: { label: "팝업", color: "amber" },
};

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  // Form
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formType, setFormType] = useState("notice");
  const [formSaving, setFormSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("users").select("id").eq("auth_id", user.id).single();
      if (profile) setProfileId(profile.id);
    }

    const { data } = await supabase
      .from("announcements")
      .select("id, title, content, type, is_pinned, is_active, created_at")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    setItems(data || []);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!formTitle.trim() || !profileId) return;
    setFormSaving(true);
    const supabase = createClient();

    await supabase.from("announcements").insert({
      author_id: profileId,
      title: formTitle.trim(),
      content: formContent.trim(),
      type: formType,
      is_pinned: false,
      is_active: true,
    });

    setShowModal(false);
    setFormTitle("");
    setFormContent("");
    setFormSaving(false);
    await loadData();
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    await supabase.from("announcements").delete().eq("id", id);
    setItems(items.filter((i) => i.id !== id));
  };

  const handleTogglePin = async (id: string, isPinned: boolean) => {
    const supabase = createClient();
    await supabase.from("announcements").update({ is_pinned: !isPinned }).eq("id", id);
    setItems(items.map((i) => (i.id === id ? { ...i, is_pinned: !isPinned } : i)));
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const supabase = createClient();
    await supabase.from("announcements").update({ is_active: !isActive }).eq("id", id);
    setItems(items.map((i) => (i.id === id ? { ...i, is_active: !isActive } : i)));
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
        <h2 className="text-base font-bold">공지사항</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-dark transition"
        >
          <Plus size={16} /> 새 공지
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
          <Bell className="mx-auto mb-3 text-gray-300" size={40} />
          <p className="text-gray-400">공지사항이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => {
            const t = TYPE_MAP[item.type] || TYPE_MAP.notice;
            return (
              <div key={item.id} className="bg-white rounded-lg border border-gray-100 p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {item.is_pinned && <Pin size={12} className="text-brand" />}
                    <Badge color={t.color}>{t.label}</Badge>
                    {!item.is_active && <Badge color="gray">비활성</Badge>}
                    <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(item.created_at)}</span>
                </div>
                {item.content && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.content}</p>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePin(item.id, item.is_pinned)}
                    className={`px-2.5 py-1 text-xs rounded border transition ${
                      item.is_pinned
                        ? "text-brand border-brand bg-orange-50"
                        : "text-gray-400 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {item.is_pinned ? "고정 해제" : "고정"}
                  </button>
                  <button
                    onClick={() => handleToggleActive(item.id, item.is_active)}
                    className="px-2.5 py-1 text-xs text-gray-400 border border-gray-200 rounded hover:bg-gray-50 transition"
                  >
                    {item.is_active ? "비활성" : "활성화"}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-2.5 py-1 text-xs text-red-400 border border-red-200 rounded hover:bg-red-50 transition"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-[480px] p-6 mx-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold">새 공지사항</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">유형</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand bg-white"
                >
                  <option value="notice">공지</option>
                  <option value="banner">배너</option>
                  <option value="popup">팝업</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">제목 *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="공지 제목"
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand transition"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">내용</label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="공지 내용"
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand transition resize-none"
                />
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
                disabled={formSaving || !formTitle.trim()}
                className="px-4 py-2 text-sm font-semibold text-white bg-brand rounded-lg hover:bg-brand-dark disabled:opacity-50"
              >
                {formSaving ? "저장 중..." : "등록"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
