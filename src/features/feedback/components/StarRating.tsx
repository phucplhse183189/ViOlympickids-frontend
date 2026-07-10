import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: number;
}

export function StarRating({ rating, onRatingChange, readOnly = false, size = 20 }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex gap-1" onMouseLeave={() => !readOnly && setHoverRating(0)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hoverRating || rating);
        return (
          <button
            key={star}
            type="button"
            className={`transition-colors duration-200 ${
              readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"
            }`}
            disabled={readOnly}
            onClick={() => !readOnly && onRatingChange?.(star)}
            onMouseEnter={() => !readOnly && setHoverRating(star)}
          >
            <Star
              size={size}
              className={`${
                isFilled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-gray-300"
              } transition-all duration-300`}
            />
          </button>
        );
      })}
    </div>
  );
}
