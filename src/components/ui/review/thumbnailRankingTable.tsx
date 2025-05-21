// thumbnailRankingTable.tsx
"use client";
import React from 'react'
import { AspectKey, ThumbnailReview } from './types'
import AspectSelector from './aspectSelector'

type Props = {
  thumbnails: ThumbnailReview[]
  selectedAspect: AspectKey
  onAspectChange: (key: AspectKey) => void
  onSelect: (id: string) => void
  selectedId: string
}

const ThumbnailRankingTable: React.FC<Props> = ({
  thumbnails,
  selectedAspect,
  onAspectChange,
  onSelect,
  selectedId
}) => {
  return (
    <div className="w-1/3 bg-muted rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <span className="font-semibold">Ranking by:</span>
        <AspectSelector value={selectedAspect} onChange={onAspectChange} />
      </div>
      <div className="space-y-2">
        {thumbnails.map((thumb, index) => (
          <div
            key={thumb.id}
            onClick={() => onSelect(thumb.id)}
            className={`p-2 rounded cursor-pointer flex justify-between items-center
              ${selectedId === thumb.id ? 'bg-primary text-white' : 'hover:bg-accent'}`}
          >
            <span>{index + 1}. {thumb.title}</span>
            <span className="font-bold">{thumb.aspectRatings[selectedAspect].score.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ThumbnailRankingTable
