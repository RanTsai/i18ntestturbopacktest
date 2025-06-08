import React from "react";
import { Star } from "lucide-react";

interface UserReviewProps {
  name: string;
  rating: number;
  comment: string;
  favorite: string;
  timeAgo: string;
}

export default function UserFeedback({
  name,
  rating,
  comment,
  favorite,
  timeAgo,
}: UserReviewProps) {
  return (
    <div className="space-y-1 border-b border-gray-700 pb-3 mb-3">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">{name}</h3>
        <span className="text-sm text-gray-400">{timeAgo}</span>
      </div>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i <= rating ? "text-yellow-400" : "text-gray-600"}`}
            fill={i <= rating ? "currentColor" : "none"}
          />
        ))}
      </div>
      <p className="text-sm text-gray-200">{comment}</p>
      <p className="text-sm">
        <span className="font-semibold text-gray-300">Favorite:</span> {favorite}
      </p>
    </div>
  );
}
