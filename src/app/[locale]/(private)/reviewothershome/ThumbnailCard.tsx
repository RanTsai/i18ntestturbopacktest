"use client"

import Link from "next/link"
import Image from "next/image"
import dayjs from "dayjs"
import { useParams, useRouter } from "next/navigation"
import useTranslationStore from "@/lib/global-store/use-translation-store"
import { Clock, Ban, Coins, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"


import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { IHumanReview } from "@/lib/schema/human-review-schema"

interface HumanReviewCardProps {
  pageId: string;
  thumb: IHumanReview
  onGallery: (id: string) => void
  onSubmitReview: (id: number, newRating: number) => void
  reviewed: boolean
  isOwner: boolean
}

export function HumanReviewCard({ pageId, thumb, onGallery, onSubmitReview, reviewed, isOwner }: HumanReviewCardProps) {
  const { getTranslation } = useTranslationStore();
  const { locale } = useParams() as { locale: string }

  const translations = getTranslation(pageId, locale) || {};

  const now = dayjs()
  const deadlineDate = dayjs(thumb.deadline)
  const diff = deadlineDate.diff(now, "day")

  const router = useRouter();
  const isStillOpen = diff >= 0
  const formattedDeadline = isStillOpen
    ? `${translations?.Closing_days_noticiation?.translation || "Closing in"} ${diff} ${translations?.days?.translation || "day"}`
    : `${translations?.Closed_days_noticiation?.translation || "Closed"} ${Math.abs(diff)}  ${translations?.days_ago?.translation || "days ago"}`

  // ? `${translations?.Closing_days_noticiation?.translation || "Closing in"} ${diff} ${translations?.days?.translation || "day"}${diff === 1 ? "" : "s"}`
  // : `${translations?.Closed_days_noticiation?.translation || "Closed"} ${Math.abs(diff)}  ${translations?.days_ago?.translation || "days"} ${Math.abs(diff) === 1 ? "" : "s"} ago`
  return (
    <>
      <div className="group w-full md:w-72 rounded-2xl overflow-hidden shadow hover:shadow-lg transition-all bg-white">
        {/* ✅ Deadline 狀態 */}
        <div className={`w-full px-3 py-2 text-xs font-medium flex items-center gap-1
          ${isStillOpen ? "bg-secondary text-green-700" : "bg-red-100 text-red-600"}`}>
          {isStillOpen ? (
            <>
              <Clock className="w-4 h-4" />
              {formattedDeadline}
            </>
          ) : (
            <>
              <Ban className="w-4 h-4" />
              {formattedDeadline}
            </>
          )}
        </div>

        {/* ✅ 圖片區域 */}
      <div className="relative w-full h-40">
  <Link
    href={
      isOwner === false
        ? `/helpothers/${thumb.human_review_id}?reviewed=${reviewed}`
        : `/thumbnailanalysisreport/${thumb.human_review_id}?reviewed=${reviewed}`
    }
  >
    <Image
      src={thumb.thumbnails[0] ?? "https://placehold.co/600x400/png"}
      alt={thumb.title ?? "Image Not available"}
      fill
      className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
    />
  </Link>


          {/* ✅ 已評分標籤 */}
          {reviewed && (
            <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded shadow">
              {translations?.rated?.translation || "Rated"}
            </div>
          )}
        </div>

        {/* ✅ 內容區域 */}
        <div className="px-3 pt-3 pb-2">
          <h3 className="text-lg font-semibold mb-1">{thumb.title}</h3>

          <div className="flex items-center space-x-2 mb-1">
            <Avatar className="w-6 h-6">
              <AvatarImage src={thumb.channel_logo} alt={thumb.channel_name} />
              <AvatarFallback>{thumb.channel_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{thumb.channel_name}</span>
          </div>

          <div className="text-sm mb-2 space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-500">⭐</span>
              <span className="text-gray-500">({thumb.rating_count} {translations?.people_rated?.translation || "People Rated"})</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-primary"><Eye size={16} /></span>
              <span className="text-gray-500">({thumb.view_count} {translations?.people_viewed?.translation || "People Viewed"})</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            {thumb.tags.map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 bg-gray-200 rounded">
                {tag}
              </span>
            ))}
          </div>

          {/* ✅ 操作按鈕 */}
          <div className="flex justify-between">
            {reviewed ? (
              <Button variant="outline" size="sm" disabled>
                {translations?.thank_you_for_rating_button?.translation || "Thank you for rating"}              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(`/helpothers/${thumb.human_review_id}?reviewed=${reviewed}`)
                }
                className="hover:bg-green-500 hover:text-white transition-colors"
              >
                {translations?.review_and_get_button?.translation || "Rate and get"}{" "}
                {thumb.credit_reward} <Coins className="ml-1 w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

    </>
  )
}
