// edu 서비스 설정 — check-deposit / deposit-sms 에서 공통 참조
export const EDU_SERVICE = {
  id: "edu",
  platform: "리바운드에듀",
  product: "강의 수강료",
  targetTable: "edu_orders",
  targetSelect:
    "id,order_id,buyer_name,buyer_phone,depositor_name,amount,status,created_at,deposit_valid_until,deposit_confirmed_at,paid_at,course_title",
  targetIdColumn: "id",
  orderIdColumn: "order_id",
  amountColumn: "amount",
  depositorColumn: "depositor_name",
  fallbackDepositorColumns: ["buyer_name"],
  statusColumn: "status",
  paidStatus: "결제완료",
  paidStatuses: ["결제완료", "입금확인"],
  paidAtColumn: "paid_at",
  confirmedAtColumn: "deposit_confirmed_at",
  paymentMethodColumn: "payment_method",
  validHours: 12,
};
