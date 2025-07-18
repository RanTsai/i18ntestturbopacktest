import { ThumbnailReview, AspectRating } from "@/components/ui/review/types";

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
  version: string;
  aiFeedback: AiFeedback | null;
}

export function MapAiScoreToThumbnailReview({
  url,
  version,
  aiFeedback,
}: MapAiFeedbackInput): ThumbnailReview {
  if (!aiFeedback || !aiFeedback.scores) {
    console.warn("No AI feedback or scores available for URL:", url);
    return {
      id: url,
      version,
      imageUrl: url,
      aiCommentMarkdown: "No AI feedback available.",
      aspectRatings: {},
    };
  }
  const scores = aiFeedback.scores || {};
  console.log("AI feedback scores", scores);

  const aspectRatings: Record<string, AspectRating> = Object.fromEntries(
    Object.entries(scores).map(([key, value]) => [
      key,
      {
        score: typeof value === "number" ? value : 0,
        explanation: `Explanation for ${key} (placeholder)`,
      },
    ])
  );

  console.log("Creating aspect ratings from AI feedback", aspectRatings);

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
    version,
    imageUrl: url,
    aiCommentMarkdown,
    aspectRatings,
  };
}