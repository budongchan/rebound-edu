"use client";

import { useState } from "react";
import Badge from "@/components/ui/Badge";
import { Save, Settings } from "lucide-react";

export default function AdminSettingsPage() {
  const [defaultFee, setDefaultFee] = useState("30");
  const [enrollmentExpiry, setEnrollmentExpiry] = useState("365");
  const [maxCouponsPerUser, setMaxCouponsPerUser] = useState("3");
  const [autoApproveStudents, setAutoApproveStudents] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In production, save to DB or environment config
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold">설정</h2>
        {saved && <Badge color="green">저장됨</Badge>}
      </div>

      <div className="space-y-5">
        {/* Platform settings */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <Settings size={14} className="text-gray-500" />
            플랫폼 설정
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">기본 수수료율</p>
                <p className="text-xs text-gray-400">전문가 매출에서 차감되는 플랫폼 수수료</p>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={defaultFee}
                  onChange={(e) => setDefaultFee(e.target.value)}
                  className="w-[60px] h-9 px-2 border border-gray-200 rounded-lg text-sm text-center outline-none focus:border-brand"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">수강 기한</p>
                <p className="text-xs text-gray-400">수강 신청 후 접근 가능한 기간 (0 = 무제한)</p>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={enrollmentExpiry}
                  onChange={(e) => setEnrollmentExpiry(e.target.value)}
                  className="w-[60px] h-9 px-2 border border-gray-200 rounded-lg text-sm text-center outline-none focus:border-brand"
                />
                <span className="text-sm text-gray-500">일</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">1인당 쿠폰 사용 제한</p>
                <p className="text-xs text-gray-400">사용자 1명이 동시에 사용 가능한 최대 쿠폰 수</p>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={maxCouponsPerUser}
                  onChange={(e) => setMaxCouponsPerUser(e.target.value)}
                  className="w-[60px] h-9 px-2 border border-gray-200 rounded-lg text-sm text-center outline-none focus:border-brand"
                />
                <span className="text-sm text-gray-500">개</span>
              </div>
            </div>
          </div>
        </div>

        {/* Toggle settings */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-sm font-bold mb-4">가입 · 인증</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">고객 자동 승인</p>
                <p className="text-xs text-gray-400">고객 가입 시 즉시 활성화 (전문가/직원은 항상 수동 승인)</p>
              </div>
              <button
                onClick={() => setAutoApproveStudents(!autoApproveStudents)}
                className={`w-11 h-6 rounded-full transition relative ${
                  autoApproveStudents ? "bg-brand" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-all ${
                    autoApproveStudents ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">점검 모드</p>
                <p className="text-xs text-gray-400">활성화 시 관리자 외 모든 접근 차단</p>
              </div>
              <button
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`w-11 h-6 rounded-full transition relative ${
                  maintenanceMode ? "bg-red-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-all ${
                    maintenanceMode ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-dark transition"
          >
            <Save size={14} /> 설정 저장
          </button>
        </div>
      </div>
    </>
  );
}
