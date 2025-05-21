// ============================
// 4. /lib/ai/handlers/generateThumbnailFeedbackPrompt.ts
// ============================

export function generateThumbnailFeedbackPrompt(
  input: { title: string; imageDescription: string },
  language: string
) {
  return [
    {
      role: 'system',
      content: `You are a professional YouTube thumbnail analyst. Please reply in ${language}.`
    },
    {
      role: 'user',
      content: `Please evaluate the following thumbnail based on 5 aspects.
Title: ${input.title}
Image Description: ${input.imageDescription}
Return score and one-sentence comment for each aspect.`
    }
  ]
}
