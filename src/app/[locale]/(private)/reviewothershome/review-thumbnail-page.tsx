"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import useReviewDataStore from "@/lib/global-store/human-review-data-store"
import useReviewFilterStore from "@/lib/global-store/human-review-filter-store"
import { Button } from "@/components/ui/button"
import { HumanReviewCard } from "./ThumbnailCard"
import { GetHumanReviewFromSupabase } from "@/actions/supabase/supabase_human_review"
import UserChannelStore from "@/lib/global-store/user-channel-store"
import useFollowingChannelStore from "@/lib/global-store/following-channel-store"
import userGlobalStore from "@/lib/global-store/users-store"
import useTranslationStore from "@/lib/global-store/use-translation-store"
import { PageTranslations } from "@/i18n/interface"

export function getChannelNameById(id: number): string {
  const userStore = UserChannelStore.getState()
  const followStore = useFollowingChannelStore.getState()

  const fromMyChannels = userStore.userChannels?.find(c => c.user_channel_id === id)
  if (fromMyChannels) return fromMyChannels.channel_name

  const fromFollowing = followStore.followingChannels?.find(c => c.user_channel_id === id)
  if (fromFollowing) return fromFollowing.channel_name

  return "Unknown Channel"
}

export default function ReviewThumbnailsPage() {
  const router = useRouter()
  const { locale } = useParams() as { locale: string }
  const theUser = userGlobalStore(s => s.theUser)
  const clerkUserId = theUser?.clerk_user_id || ""
  const pageId = "review_community_page";


  const { getTranslation } = useTranslationStore();

  const translations = getTranslation(pageId, locale) || {};

  const {
    data: allReviews,
    isLoading,
    setData,
    setLoading,
  } = useReviewDataStore()

  const {
    selectedTags,
    keyword,
    selectedMyChannelId,
    selectedFollowingChannelId,
    sortMode,
    setSortMode,
    setTags,
    setKeyword,
    setMyChannel,
    setFollowingChannel,
    resetFilters,
  } = useReviewFilterStore()

  const { followingChannels, fetchFollowingChannels } = useFollowingChannelStore()

  const [allTags, setAllTags] = useState<string[]>([])
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([])

  const selectedChannelName = useMemo(() => {
    if (selectedMyChannelId) return getChannelNameById(selectedMyChannelId)
    if (selectedFollowingChannelId) return getChannelNameById(selectedFollowingChannelId)
    return null
  }, [selectedMyChannelId, selectedFollowingChannelId])

  const ratedThumbnails = useMemo(() => {
    return allReviews.filter(item => item.reviewer?.includes(clerkUserId))
  }, [allReviews, clerkUserId])

  const filteredThumbnails = useMemo(() => {
    return allReviews
      .filter(item => {
        // 排除已被該用戶評分的縮圖
        if (item.reviewer?.includes(clerkUserId)) return false

        if (selectedTags.length && !item.tags.some(tag => selectedTags.includes(tag))) return false

        const lowerKeyword = keyword.toLowerCase()
        if (
          keyword &&
          !item.title.toLowerCase().includes(lowerKeyword) &&
          !item.channel_name.toLowerCase().includes(lowerKeyword) &&
          !item.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
        )
          return false

        if (selectedChannelName && item.channel_name !== selectedChannelName) return false

        return true
      })
      .sort((a, b) => {
        if (sortMode === "latest") {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        }
        if (sortMode === "trending") {
          return b.view_count - a.view_count
        }
        return 0
      })
  }, [allReviews, selectedTags, keyword, selectedChannelName, sortMode, clerkUserId])

  const handleSelectChannel = (group: "myChannels" | "following", id: number) => {
    if (group === "myChannels") {
      if (selectedMyChannelId === id) {
        setMyChannel(null)
      } else {
        setMyChannel(id)
        setFollowingChannel(null)
      }
    } else {
      if (selectedFollowingChannelId === id) {
        setFollowingChannel(null)
      } else {
        setFollowingChannel(id)
        setMyChannel(null)
      }
    }
  }

  useEffect(() => {
    setData([]) // 清除前次資料（避免語系混用）
    const fetchInitial = async () => {
      setLoading(true)
      const res = await GetHumanReviewFromSupabase(null, null, null, null, null, locale, 100, 1, 100)
      if (res.success && res.data) {
        setData(res.data)
        const tags = res.data.flatMap(r => r.tags)
        const uniqueTags = Array.from(new Set(tags))
        setAllTags(uniqueTags)
      }
      setLoading(false)
    }
    fetchInitial()
  }, [locale])

  useEffect(() => {
    if (followingChannels.length === 0) {
      fetchFollowingChannels()
    }
  }, [])

  useEffect(() => {
    if (!keyword.trim()) {
      setTagSuggestions([])
      return
    }

    const lowerKeyword = keyword.toLowerCase()
    const suggestions = allTags
      .filter(tag => tag.toLowerCase().includes(lowerKeyword))
      .slice(0, 5)
    setTagSuggestions(suggestions)
  }, [keyword, allTags])

  const handleGallery = (id: string) => {
    router.push("/helpothers")
  }

  const handleReviewSubmit = (id: number, rating: number) => {
    console.log("Submit review:", id, rating)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{translations?.page_header?.translation || "Review Community"}</h1>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {allTags.map(tag => {
          const selected = selectedTags.includes(tag)
          return (
            <button
              key={tag}
              onClick={() =>
                selected
                  ? setTags(selectedTags.filter(t => t !== tag))
                  : setTags([...selectedTags, tag])
              }
              className={`px-3 py-1 rounded-full border transition
                ${selected
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
                }`}
            >
              {tag}
            </button>
          )
        })}
      </div>

      {/* Sort + Search */}
      <div className="flex items-center space-x-4 mb-6">
        <button onClick={() => setSortMode("trending")} className="px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition">
          {translations?.trending_button?.translation || "Trending"}
        </button>
        <button onClick={() => setSortMode("latest")} className="px-4 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition">
          {translations?.latest_button?.translation || "Latest"}
        </button>

        <div className="relative w-full">
          <input
            type="text"
            placeholder={translations?.search_bar?.translation || "Search Title / Channel Name / Tags"}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="px-3 py-1 border rounded w-full focus:ring focus:ring-blue-200 transition"
          />
          {tagSuggestions.length > 0 && (
            <div className="absolute bg-white border mt-1 rounded shadow z-10 w-full max-h-40 overflow-auto">
              {tagSuggestions.map((tag) => (
                <div
                  key={tag}
                  className="px-3 py-1 cursor-pointer hover:bg-blue-100"
                  onClick={() => {
                    if (!selectedTags.includes(tag)) {
                      setTags([...selectedTags, tag])
                    }
                    setKeyword("")
                    setTagSuggestions([])
                  }}
                >
                  Add tag: <strong>{tag}</strong>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button variant="outline" className="text-sm" onClick={resetFilters}>
          {translations?.reset_button?.translation || "Reset"}
        </Button>
      </div>

      {/* Review Cards */}
      {isLoading ? (
        <p>{translations?.loading?.translation || "Loading..."}</p>
      ) : filteredThumbnails.length === 0 ? (
        <p>{translations?.no_thumbnails_found?.translation || "No thumbnails matching the search critiera"}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredThumbnails.map((thumb) => (
            <HumanReviewCard
              pageId={pageId}
              key={thumb.created_at}
              thumb={thumb}
              onGallery={handleGallery}
              onSubmitReview={handleReviewSubmit}
              reviewed={false}
            />
          ))}
        </div>
      )}

      {/* Reviewed By You */}
      {ratedThumbnails.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold mb-4">{translations?.reviewed_by_you_section?.translation || "Reviewed By You"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 opacity-70">
            {ratedThumbnails.map((thumb) => (
              <HumanReviewCard
                pageId={pageId}
                key={thumb.created_at + "-rated"}
                thumb={thumb}
                onGallery={handleGallery}
                onSubmitReview={handleReviewSubmit}
                reviewed={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
