
export type AspectRating = {
  score: number;
  explanation: string;
};

export type ThumbnailReview = {
  id: string;
  version: string;
  imageUrl: string;
  aiCommentMarkdown: string;
  aspectRatings: Record<string, AspectRating>; // ✅ 改為 string key
};