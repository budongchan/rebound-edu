"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader } from "lucide-react";

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const paymentId = searchParams.get("paymentId");
    const code = searchParams.get("code");

    if (code) {
      // 결제 오류 또는 사용자 취소
      setStatus("error");
      setMessage(searchParams.get("message") || "결제가 취소되었습니다.");
      return;
    }

    if (!paymentId) {
      setStatus("error");
      setMessage("결제 정보를 찾을 수 없습니다.");
      return;
    }

    // 서버에 결제 완료 검증 요청
    const verify = async () => {
      try {
        const res = await fetch("/api/payment/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId }),
        });
        const data = await res.json();

        if (res.ok && data.success) {
          setStatus("success");
          setMessage("결제가 완료되었습니다!");
        } else {
          setStatus("error");
          setMessage(data.error || "결제 검증에 실패했습니다.");
        }
      } catch {
        setStatus("error");
        setMessage("결제 확인 중 오류가 발생했습니다.");
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center py-20">
      {status === "loading" && (
        <>
          <Loader className="animate-spin text-brand mb-4" size={48} />
          <p className="text-gray-600 font-medium">
            결제를 확인하고 있습니다...
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-5">
            <CheckCircle className="text-green-500" size={40} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">{message}</h1>
          <p className="text-sm text-gray-500 mb-6">
            강의가 등록되었습니다. 지금 바로 수강을 시작하세요!
          </p>
          <button
            onClick={() => router.push("/student")}
            className="px-8 py-3 rounded-lg bg-brand text-white font-semibold text-sm hover:bg-brand-dark transition"
          >
            내 강의실로 이동
          </button>
        </>
      )}

      {status === "error" && (
        <>
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-5">
            <XCircle className="text-red-500" size={40} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            결제 실패
          </h1>
          <p className="text-sm text-gray-500 mb-6">{message}</p>
          <button
            onClick={() => router.push("/student/explore")}
            className="px-8 py-3 rounded-lg bg-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-300 transition"
          >
            강의 탐색으로 돌아가기
          </button>
        </>
      )}
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  );
}
