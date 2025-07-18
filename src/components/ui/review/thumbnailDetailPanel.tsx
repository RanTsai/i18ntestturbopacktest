//thumbnailDetailPanel.tsx
import React from 'react'
import { AspectKey, ThumbnailReview } from './types'
import AspectScoreBar from './aspectScoreBar'
import ReactMarkdown from 'react-markdown'

type Props = {
  data: ThumbnailReview
  selectedAspect: AspectKey
}

const ThumbnailDetailPanel: React.FC<Props> = ({ data }) => {
  return (
  <div className="bg-background p-6 rounded-lg w-full">
      <img src={data.imageUrl} alt={data.title} className="w-full rounded-lg mb-4" />
      <h2 className="text-xl font-semibold mb-4">{data.title}</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {Object.entries(data.aspectRatings).map(([key, rating]) => (
          <AspectScoreBar key={key} aspectKey={key as AspectKey} rating={rating} />
        ))}
      </div>
      <div className="prose bg-muted p-4 rounded-lg max-w-full">
        <ReactMarkdown>{data.aiCommentMarkdown}</ReactMarkdown>
      </div>
    </div>
  )
}

export default ThumbnailDetailPanel
