// components/review/StarRating.tsx
"use client";

export function StarRating({ score }: { score: number }) {
   const clampedScore = Math.min(Math.max(score, 0), 5);

  const fullStars = Math.floor(clampedScore);
  const halfStar = clampedScore % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center space-x-1">
      {[...Array(fullStars)].map((_, i) => (
        <span key={i} className="text-yellow-400 text-lg">★</span>
      ))}
      {halfStar && <span className="text-yellow-400 text-lg">☆</span>}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={i} className="text-gray-600 text-lg">☆</span>
      ))}
      <span className="ml-2 text-sm text-white">{clampedScore.toFixed(1)} / 5</span>
    </div>
  );
}