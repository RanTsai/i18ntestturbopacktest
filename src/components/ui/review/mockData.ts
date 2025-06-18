import { ThumbnailReview } from './types'

export const mockThumbnails: ThumbnailReview[] = [
    {
        id: "1",
        title: "Thumbnail 1",
        imageUrl: "/thumbnail1.png",
        aiCommentMarkdown: "### Summary\nA bold and engaging image.",
        aspectRatings: {
            Clickability: { score: 4.3, explanation: "Eye-catching subject and composition." },
            Clarity: { score: 3.8, explanation: "Text may be small in mobile view." },
            Relevance: { score: 4.5, explanation: "Matches the video's topic well." },
            CTR: { score: 4.1, explanation: "Likely to drive clicks due to strong visual." },
            Branding: { score: 3.0, explanation: "Brand identity could be stronger." }
        }
    },
    {
        id: "2",
        title: "Thumbnail 2",
        imageUrl: "/thumbnail2.png",
        aiCommentMarkdown: "### Summary\nWell-lit and emotionally driven.",
        aspectRatings: {
            Clickability: { score: 3.9, explanation: "Strong colors attract attention." },
            Clarity: { score: 4.2, explanation: "Text is readable and image is sharp." },
            Relevance: { score: 3.5, explanation: "May confuse some viewers." },
            CTR: { score: 3.8, explanation: "Decent performance expected." },
            Branding: { score: 3.9, explanation: "Good alignment with channel visuals." }
        }
    },
    {
        id: "3",
        title: "Thumbnail 3",
        imageUrl: "/thumbnail3.png",
        aiCommentMarkdown: "### Summary\nWell-lit and emotionally driven.",
        aspectRatings: {
            Clickability: { score: 3.9, explanation: "Strong colors attract attention." },
            Clarity: { score: 4.2, explanation: "Text is readable and image is sharp." },
            Relevance: { score: 3.5, explanation: "May confuse some viewers." },
            CTR: { score: 3.8, explanation: "Decent performance expected." },
            Branding: { score: 3.9, explanation: "Good alignment with channel visuals." }
        }
    }
  // 可再擴充更多...
]

