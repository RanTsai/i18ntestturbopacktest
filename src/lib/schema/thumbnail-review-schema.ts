import { z } from "zod";

export const ThumbnailReviewSchema = z.object({
  best_thumbnail: z.string().min(1, "Please select a thumbnail"),
  best_title: z.string().min(1, "Please select a title"),

  overall_impression: z.string().optional(),

  eye_catchiness: z
    .string()
    .refine((val) => parseInt(val) >= 1 && parseInt(val) <= 5, {
      message: "Must be between 1 and 5",
    })
    .optional(),

  clarity: z
    .string()
    .refine((val) => parseInt(val) >= 1 && parseInt(val) <= 5, {
      message: "Must be between 1 and 5",
    })
    .optional(),

  curiosity: z
    .string()
    .refine((val) => parseInt(val) >= 1 && parseInt(val) <= 5, {
      message: "Must be between 1 and 5",
    })
    .optional(),

  branding: z
    .string()
    .refine((val) => parseInt(val) >= 1 && parseInt(val) <= 5, {
      message: "Must be between 1 and 5",
    })
    .optional(),

  suggestions: z.string().optional(),

  public_feedback: z.boolean().optional(),
  follow_creator: z.boolean().optional(),
  become_reviewer: z.boolean().optional()
});

export type ThumbnailReviewFormData = z.infer<typeof ThumbnailReviewSchema>;
