/**
 * 토스페이먼츠 V2 서버사이드 유틸리티
 * https://docs.tosspayments.com/reference
 */

const TOSS_API_BASE = "https://api.tosspayments.com/v1";

function getHeaders() {
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) throw new Error("TOSS_SECRET_KEY is not set");
  const encoded = Buffer.from(`${secretKey}:`).toString("base64");
  return {
    Authorization: `Basic ${encoded}`,
    "Content-Type": "application/json",
  };
}

/**
 * orderId 생성 (토스 규격: 영문 대소문자, 숫자, -, _ / 6~64자)
 */
export function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `rebound-${timestamp}-${random}`;
}

/**
 * 결제 승인 요청
 * 클라이언트에서 결제 완료 후 서버에서 최종 승인
 */
export async function confirmPayment(paymentKey: string, orderId: string, amount: number) {
  const response = await fetch(`${TOSS_API_BASE}/payments/confirm`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("[tosspayments] confirm error:", data);
    throw new Error(data.message || `Toss API error: ${response.status}`);
  }

  return data;
}

/**
 * 결제 단건 조회
 */
export async function getPayment(paymentKey: string) {
  const response = await fetch(
    `${TOSS_API_BASE}/payments/${encodeURIComponent(paymentKey)}`,
    { headers: getHeaders() },
  );

  if (!response.ok) {
    const errBody = await response.text();
    console.error("[tosspayments] getPayment error:", response.status, errBody);
    throw new Error(`Toss API error: ${response.status}`);
  }

  return response.json();
}

/**
 * 결제 취소 (환불)
 */
export async function cancelPayment(paymentKey: string, cancelReason: string, cancelAmount?: number) {
  const body: Record<string, unknown> = { cancelReason };
  if (cancelAmount) body.cancelAmount = cancelAmount;

  const response = await fetch(
    `${TOSS_API_BASE}/payments/${encodeURIComponent(paymentKey)}/cancel`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const errBody = await response.text();
    console.error("[tosspayments] cancel error:", response.status, errBody);
    throw new Error(`Toss cancel error: ${response.status}`);
  }

  return response.json();
}
