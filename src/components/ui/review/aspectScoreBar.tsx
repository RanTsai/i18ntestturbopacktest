import React from 'react'
import { AspectKey, AspectRating } from './types'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

type Props = {
  aspectKey: AspectKey
  rating: AspectRating
}

const AspectScoreBar: React.FC<Props> = ({ aspectKey, rating }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex justify-between bg-secondary p-2 rounded cursor-pointer hover:bg-accent transition-all">
          <span className="font-medium">{aspectKey}</span>
          <span className="font-bold text-red-500">{rating.score.toFixed(1)}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-sm">
        {rating.explanation}
      </TooltipContent>
    </Tooltip>
  )
}

export default AspectScoreBar
