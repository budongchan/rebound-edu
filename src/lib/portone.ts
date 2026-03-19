/**
 * PortOne V2 서버사이드 유틸리티
 * REST API 직접 호출 방식 (서버 SDK 의존 없이 안정적)
 */

const PORTONE_API_BASE = "https://api.portone.io";

function getHeaders() {
  return {
    Authorization: `PortOne ${process.env.PORTONE_API_SECRET}`,
    "Content-Type": "application/json",
  };
}

/**
 * paymentId 생성 유틸리티
 * 포트원 규격: 영문대소문자 + 숫자 + -_. 6~64자
 */
export function generatePaymentId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `rebound-${timestamp}-${random}`;
}

/**
 * 포트원 결제 내역 단건 조회
 */
export async function getPortOnePayment(paymentId: string) {
  const response = await fetch(
    `${PORTONE_API_BASE}/payments/${encodeURIComponent(paymentId)}`,
    { headers: getHeaders() }
  );

  if (!response.ok) {
    const errBody = await response.text();
    console.error("[portone] getPayment error:", response.status, errBody);
    throw new Error(`PortOne API error: ${response.status}`);
  }

  return response.json();
}

/**
 * 결제 취소 (환불)
 */
export async function cancelPortOnePayment(
  paymentId: string,
  reason: string,
  amount?: number
) {
  const body: Record<string, unknown> = { reason };
  if (amount) body.amount = amount;

  const response = await fetch(
    `${PORTONE_API_BASE}/payments/${encodeURIComponent(paymentId)}/cancel`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errBody = await response.text();
    console.error("[portone] cancelPayment error:", response.status, errBody);
    throw new Error(`PortOne cancel error: ${response.status}`);
  }

  return response.json();
}
