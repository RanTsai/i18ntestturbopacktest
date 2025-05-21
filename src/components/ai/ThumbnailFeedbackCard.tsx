'use client';

import Image from 'next/image';
import { useAIStream } from '@/lib/ai/hooks/useAIStreams';
import { StarRating } from '@/components/ui/review/starrating';
import RadarChart from '@/components/ui/review/radarchart';
import AspectBarList from '@/components/ui/review/aspectbarlist';
import ReactMarkdown from 'react-markdown';

type Props = {
  thumbnailUrl: string
  title: string
  imageDescription: string
  language: string
}

export default function ThumbnailFeedbackCard({ thumbnailUrl, title, imageDescription, language }: Props) {
  const { result, loading, error } = useAIStream(`/api/ai-dispatch`, {
    type: 'thumbnail_feedback',
    input: { title, imageDescription },
    language
  })

  if (loading) return <div className="text-white">Analyzing thumbnail...</div>
  if (error) return <div className="text-red-500">Error: {error.message}</div>
  if (!result) return null

  const aspects = ['Clickability', 'Clarity', 'Relevance', 'CTR', 'Branding'] as const

  const aspectData = aspects.map(key => ({
    label: key,
    value: result[key].score
  }))

  const averageScore =
    aspectData.reduce((sum, a) => sum + a.value, 0) / aspectData.length

  const markdown = aspects
    .map(key => `### ${key}\n${result[key].comment}`)
    .join('\n\n')

  return (
    <div className="bg-[#0d0d0d] rounded-lg p-6 shadow-md space-y-4 w-full max-w-md text-white">
      <Image src={thumbnailUrl} width={600} height={400} alt="Thumbnail" className="rounded-md w-full h-auto" />

      <input
        type="text"
        value={title}
        readOnly
        className="w-full p-2 bg-black border border-gray-700 rounded"
      />

      <div className="flex items-center justify-between">
        <StarRating score={averageScore} />
        <span className="text-sm text-gray-400">Average Score: {averageScore.toFixed(1)}</span>
      </div>

      <RadarChart data={aspectData.map(a => a.value)} />

      <AspectBarList aspects={aspectData} />

      <div className="text-sm text-gray-300 leading-6 whitespace-pre-wrap">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
    </div>
  )
}
