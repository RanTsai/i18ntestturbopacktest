// thumbnailRankingBoard.tsx
'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { ThumbnailReview } from './types';

import ThumbnailRankingTable from './thumbnailRankingTable';
import ThumbnailDetailPanel from './thumbnailDetailPanel';

interface ThumbnailRankingBoardProps {
  thumbnails: ThumbnailReview[];
}

const ThumbnailRankingBoard: React.FC<ThumbnailRankingBoardProps> = ({ thumbnails }) => {
  // TODO: Consider making 'Clickability' dynamic or a prop if aspects can vary
  const [selectedAspect, setSelectedAspect] = useState<string>('clickability');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (thumbnails && thumbnails.length > 0) {
      // If no ID is selected, or if the selected ID is no longer in the list, select the first one.
      if (!selectedId || !thumbnails.find(t => t.id === selectedId)) {
        setSelectedId(thumbnails[0].id);
      }
    } else {
      // If there are no thumbnails, clear the selection.
      setSelectedId(null);
    }
  }, [thumbnails, selectedId]);

  const sortedThumbnails = useMemo(() => {
    if (!thumbnails || thumbnails.length === 0) return [];
    // Ensure aspectRatings and the selectedAspect exist before sorting
    return [...thumbnails].sort((a, b) => {
      const scoreA = a.aspectRatings?.[selectedAspect]?.score ?? 0;
      const scoreB = b.aspectRatings?.[selectedAspect]?.score ?? 0;
      return scoreB - scoreA;
    });
  }, [thumbnails, selectedAspect]);

  const selectedThumbnail = useMemo(() => {
    if (!selectedId || sortedThumbnails.length === 0) return null;
    return sortedThumbnails.find(t => t.id === selectedId) || sortedThumbnails[0] || null;
  }, [selectedId, sortedThumbnails]);

  if (!thumbnails || thumbnails.length === 0) {
    return <div className="text-center p-4 text-gray-500">No thumbnail data with AI feedback is available to rank.</div>;
  }

  if (!selectedThumbnail && selectedId) {
    // This might happen briefly if thumbnails update and selectedId is temporarily invalid
    return <div className="text-center p-4">Loading thumbnail details...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full p-4 bg-gray-50 rounded-lg shadow items-start">
      <div className="w-full md:w-1/3">

        {selectedId ? (
          <ThumbnailRankingTable
            thumbnails={sortedThumbnails}
            selectedAspect={selectedAspect}
            onAspectChange={setSelectedAspect}
            onSelect={setSelectedId}
            selectedId={selectedId}
          />
        ) : (
          thumbnails && thumbnails.length > 0 && <div className="text-center p-4 text-gray-400">Initializing selection...</div>
        )}
      </div>
      <div className="w-full md:w-2/3">
        {selectedThumbnail ? (
          <ThumbnailDetailPanel data={selectedThumbnail} selectedAspect={selectedAspect} />
        ) : (
          <div className="text-center p-4 text-gray-400">Select a thumbnail to see details.</div>
        )}
      </div>
    </div>
  );
};

export default ThumbnailRankingBoard;
