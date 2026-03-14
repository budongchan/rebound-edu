import { Star } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface CourseCardProps {
  title: string;
  instructor: string;
  rating: number;
  reviewCount: number;
  price: number;
  originalPrice?: number;
  tags?: string[];
  thumbnailColor?: string;
}

export default function CourseCard({
  title, instructor, rating, reviewCount, price, originalPrice, tags, thumbnailColor,
}: CourseCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-100 cursor-pointer hover:shadow-md transition-shadow">
      <div
        className="h-[140px] flex items-center justify-center"
        style={{ background: thumbnailColor || "linear-gradient(135deg, #f8f9fa, #e9ecef)" }}
      />
      <div className="p-4">
        {tags && (
          <div className="flex gap-1 mb-2 flex-wrap">
            {tags.map((tag) => (
              <span key={tag} className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
        <h3 className="text-sm font-bold text-gray-900 leading-snug mb-1.5 line-clamp-2">
          {title}
        </h3>
        <p className="text-xs text-gray-500 mb-2">{instructor}</p>
        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              size={13}
              fill={i <= Math.floor(rating) ? "#FFB800" : "none"}
              stroke="#FFB800"
              strokeWidth={2}
            />
          ))}
          <span className="text-[11px] text-gray-400 ml-1">({reviewCount})</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          {originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              ₩{formatPrice(originalPrice)}
            </span>
          )}
          <span className="text-[15px] font-bold text-gray-900">
            ₩{formatPrice(price)}
          </span>
        </div>
      </div>
    </div>
  );
}
