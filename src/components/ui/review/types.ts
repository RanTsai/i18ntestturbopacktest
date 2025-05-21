export type AspectKey = "Clickability" | "Clarity" | "Relevance" | "CTR" | "Branding";

export type AspectRating = {
  score: number;
  explanation: string;
};

export type ThumbnailReview = {
  id: string;
  title: string;
  imageUrl: string;
  aiCommentMarkdown: string;
  aspectRatings: Record<AspectKey, AspectRating>;
};
