import { ThumbnailReview, AspectRating, AspectKey } from "@/components/ui/review/types";

interface AiFeedback {
  overall_impression?: string;
  title_strength?: string;
  thumbnail_strength?: string;
  synergy?: string;
  explanation?: string;
  scores: {
    clickability?: number;
    relevance?: number;
    clarity?: number;
    ctr?: number;
    branding?: number;
  };
}

interface MapAiFeedbackInput {
  url: string;
  title: string;
  aiFeedback: AiFeedback;
}

export function MapAiScoreToThumbnailReview({
  url,
  title,
  aiFeedback,
}: MapAiFeedbackInput): ThumbnailReview {
  const scores = aiFeedback.scores || {};

  const createAspect = (
    key: keyof typeof scores,
    label: AspectKey
  ): [AspectKey, AspectRating] => {
    return [
      label,
      {
        score: typeof scores[key] === "number" ? scores[key]! : 0,
        explanation: `Explanation for ${label} (placeholder)`, // 🔁 可替換為更真實的 AI explanation
      },
    ];
  };

  const aspectRatings: Record<AspectKey, AspectRating> = Object.fromEntries([
    createAspect("clickability", "Clickability"),
    createAspect("relevance", "Relevance"),
    createAspect("clarity", "Clarity"),
    createAspect("ctr", "CTR"),
    createAspect("branding", "Branding"),
  ]) as Record<AspectKey, AspectRating>;

  const aiCommentMarkdown = `
### Overall Impression
${aiFeedback.overall_impression || "N/A"}

### Title Strength
${aiFeedback.title_strength || "N/A"}

### Thumbnail Strength
${aiFeedback.thumbnail_strength || "N/A"}

### Synergy
${aiFeedback.synergy || "N/A"}

### Explanation
${aiFeedback.explanation || "N/A"}
`.trim();

  return {
    id: url,
    title,
    imageUrl: url,
    aiCommentMarkdown,
    aspectRatings,
  };
}
