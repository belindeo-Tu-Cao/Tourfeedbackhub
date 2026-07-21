"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  setRating?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function StarRating({ rating, setRating, readonly = false, size = 'lg', className }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          onClick={() => !readonly && setRating?.(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          className={cn(!readonly && "cursor-pointer")}
          disabled={readonly}
          aria-label={`Rate ${star} stars`}
        >
          <Star
            className={cn(
              sizeClasses[size],
              "transition-colors",
              (hoverRating || rating) >= star
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            )}
          />
        </button>
      ))}
    </div>
  );
}
