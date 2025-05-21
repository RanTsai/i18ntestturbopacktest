// ============================
// 3. /lib/ai/functions/thumbnailFeedbackSchema.ts
// ============================

export const ThumbnailFeedbackSchema = {
  name: 'rate_thumbnail_aspects',
  description: 'Rate a YouTube thumbnail based on key visual aspects.',
  parameters: {
    type: 'object',
    properties: {
      language: {
        type: 'string',
        description: 'Language code such as en, zh, ja.'
      },
      Clickability: {
        type: 'object',
        properties: {
          score: { type: 'number' },
          comment: { type: 'string' }
        },
        required: ['score', 'comment']
      },
      Clarity: {
        type: 'object',
        properties: {
          score: { type: 'number' },
          comment: { type: 'string' }
        },
        required: ['score', 'comment']
      },
      Relevance: {
        type: 'object',
        properties: {
          score: { type: 'number' },
          comment: { type: 'string' }
        },
        required: ['score', 'comment']
      },
      CTR: {
        type: 'object',
        properties: {
          score: { type: 'number' },
          comment: { type: 'string' }
        },
        required: ['score', 'comment']
      },
      Branding: {
        type: 'object',
        properties: {
          score: { type: 'number' },
          comment: { type: 'string' }
        },
        required: ['score', 'comment']
      }
    },
    required: ['language', 'Clickability', 'Clarity', 'Relevance', 'CTR', 'Branding']
  }
}