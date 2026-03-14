import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}

export default function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-5">
      <p className="text-xs text-gray-500 font-medium mb-1.5">{label}</p>
      <p
        className="text-[22px] font-bold tracking-tight"
        style={{ color: accent || "#212529" }}
      >
        {value}
      </p>
      {sub && <p className="text-[11px] text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}
