// thumbnailRankingBoard.tsx
'use client';
import React, { useState } from 'react';
import { AspectKey, ThumbnailReview } from './types';
import { mockThumbnails } from './mockData';
import ThumbnailRankingTable from './thumbnailRankingTable';
import ThumbnailDetailPanel from './thumbnailDetailPanel';

const ThumbnailRankingBoard: React.FC = () => {
  const [selectedAspect, setSelectedAspect] = useState<AspectKey>('Clickability')
  const [selectedId, setSelectedId] = useState<string>(mockThumbnails[0].id)

  const sorted = [...mockThumbnails].sort((a, b) =>
    b.aspectRatings[selectedAspect].score - a.aspectRatings[selectedAspect].score
  )

  const selectedThumbnail = sorted.find(t => t.id === selectedId) || sorted[0]

  return (
    <div className="flex gap-6 w-full">
      <ThumbnailRankingTable
        thumbnails={sorted}
        selectedAspect={selectedAspect}
        onAspectChange={setSelectedAspect}
        onSelect={setSelectedId}
        selectedId={selectedId}
      />
      <ThumbnailDetailPanel data={selectedThumbnail} selectedAspect={selectedAspect} />
    </div>
  )
}

export default ThumbnailRankingBoard;
