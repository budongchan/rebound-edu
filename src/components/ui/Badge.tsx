import { cn } from "@/lib/utils";

const variants = {
  green: "bg-green-50 text-green-700",
  blue: "bg-blue-50 text-blue-700",
  red: "bg-red-50 text-red-600",
  orange: "bg-orange-50 text-orange-600",
  amber: "bg-amber-50 text-amber-700",
  gray: "bg-gray-100 text-gray-500",
};

interface BadgeProps {
  children: React.ReactNode;
  color?: keyof typeof variants;
}

export default function Badge({ children, color = "gray" }: BadgeProps) {
  return (
    <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded whitespace-nowrap", variants[color])}>
      {children}
    </span>
  );
}
