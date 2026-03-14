"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { Award } from "lucide-react";

interface Certificate {
  enrollmentId: string;
  courseTitle: string;
  instructorName: string;
  completedAt: string;
}

export default function StudentCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profile } = await supabase
        .from("users").select("id").eq("auth_id", user.id).single();
      if (!profile) { setLoading(false); return; }

      const { data: enrollments } = await supabase
        .from("enrollments")
        .select(`
          id, completed_at,
          course:courses(title, instructor:users!courses_instructor_id_fkey(name))
        `)
        .eq("user_id", profile.id)
        .eq("status", "completed")
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false });

      const certs: Certificate[] = (enrollments || []).map((e) => {
        const rawCourse = Array.isArray(e.course) ? e.course[0] : e.course;
        let instructorName = "강사";
        if (rawCourse) {
          const rawInst = (rawCourse as Record<string, unknown>).instructor as { name: string } | { name: string }[] | null;
          const inst = Array.isArray(rawInst) ? rawInst[0] : rawInst;
          instructorName = inst?.name || "강사";
        }
        return {
          enrollmentId: e.id,
          courseTitle: (rawCourse as Record<string, unknown>)?.title as string || "강의",
          instructorName,
          completedAt: e.completed_at!,
        };
      });

      setCertificates(certs);
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
      <h2 className="text-base font-bold mb-5">수료증</h2>

      {certificates.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
          <Award className="mx-auto mb-3 text-gray-300" size={40} />
          <p className="text-gray-400 mb-1">수료증이 없습니다</p>
          <p className="text-sm text-gray-300">강의를 완강하면 수료증이 발급됩니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {certificates.map((cert) => (
            <div
              key={cert.enrollmentId}
              className="bg-white rounded-xl border border-gray-100 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-brand-light flex items-center justify-center flex-shrink-0">
                    <Award size={24} className="text-brand" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-gray-900 mb-1">
                      {cert.courseTitle}
                    </h3>
                    <p className="text-xs text-gray-500 mb-0.5">{cert.instructorName}</p>
                    <p className="text-xs text-gray-400">
                      수료일: {formatDate(cert.completedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 bg-gray-50 rounded-lg p-4">
        <p className="text-xs text-gray-500 leading-relaxed">
          수료증은 강의의 모든 차시를 완료한 후 자동으로 발급됩니다.
        </p>
      </div>
    </>
  );
}
