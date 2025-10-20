//thumbnailDetailPanel.tsx
import React from 'react'
import { AspectRating, ThumbnailReview } from './types'
import AspectScoreBar from './aspectScoreBar'
import ReactMarkdown from 'react-markdown'
import Image from 'next/image'

type Props = {
  data: ThumbnailReview
  selectedAspect: AspectRating
}

const ThumbnailDetailPanel: React.FC<Props> = ({ data }) => {
  return (
  <div className="bg-background p-6 rounded-lg w-full">
      <Image src={data.imageUrl} alt={data.id} className="w-full rounded-lg mb-4" />
      <h2 className="text-xl font-semibold mb-4">{data.id}</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {Object.entries(data.aspectRatings).map(([key, rating]) => (
          <AspectScoreBar key={key} aspectKey={key as string} rating={rating} />
        ))}
      </div>
      <div className="prose bg-muted p-4 rounded-lg max-w-full">
        <ReactMarkdown>{data.aiCommentMarkdown}</ReactMarkdown>
      </div>
    </div>
  )
}

export default ThumbnailDetailPanel
