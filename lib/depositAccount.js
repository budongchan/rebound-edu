import { BANK } from "@/lib/company";

const DEFAULT_SUFFIX_LENGTH = 6;

export function getEduAccountSuffix() {
  const configured = process.env.EDU_ACCOUNT_SUFFIX || process.env.NEXT_PUBLIC_BANK_ACCOUNT_SUFFIX;
  const raw = configured || BANK.account;
  const digits = String(raw || "").replace(/[^\d]/g, "");
  if (!digits) return "";
  if (configured) return digits;
  return digits.slice(-DEFAULT_SUFFIX_LENGTH);
}
