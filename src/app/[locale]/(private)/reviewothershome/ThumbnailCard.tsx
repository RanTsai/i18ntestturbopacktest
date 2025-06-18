//app/reviewothershome
"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { StarRating } from "@/components/ui/review/starrating" // 你的元件
import dayjs from "dayjs"


type Tag = "Tech" | "Science" | "History" | "Art" | "Gaming"

export type Thumbnail = {
  id: string
  imageUrl: string
  title: string
  author: { name: string; avatarUrl: string }
  rating: number
  reviewsCount: number
  tags: Tag[]
  deadline: string
}

interface ThumbnailCardProps {
  thumb: Thumbnail
  onGallery: (id: string) => void
  onSubmitReview: (id: string, newRating: number) => void
}

export function ThumbnailCard({ thumb, onGallery, onSubmitReview }: ThumbnailCardProps) {
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [currentRating, setCurrentRating] = useState(thumb.rating)

  const openReview = () => setDialogOpen(true)
  const closeReview = () => setDialogOpen(false)

  const handleSubmit = () => {
    onSubmitReview(thumb.id, currentRating)
    closeReview()
  }

const formattedDeadline = dayjs(thumb.deadline).format("YYYY/MM/DD");

  return (
    <>
      <Card className="w-full md:w-72 hover:shadow-lg transition-shadow relative">
        {/* Deadline 浮動標籤 */}
        <div className="absolute top-2 right-2 bg-white/80 text-xs text-gray-800 px-2 py-1 rounded shadow">
          截止：{formattedDeadline}
        </div>

        <CardHeader className="p-0">
          <div className="relative w-full h-40 rounded overflow-hidden">
            <Link href="/helpothers">
              <Image
                src={thumb.imageUrl}
                alt={thumb.title}
                layout="fill"
                objectFit="cover"
              />
            </Link>
          </div>
        </CardHeader>

        <CardContent>
          <h3 className="text-lg font-semibold mb-2">{thumb.title}</h3>

          {/* 作者資訊 */}
          <div className="flex items-center space-x-2 mb-1">
            <Avatar className="w-6 h-6">
              <AvatarImage src={thumb.author.avatarUrl} alt={thumb.author.name} />
              <AvatarFallback>{thumb.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{thumb.author.name}</span>
          </div>

          {/* 星星與評分人數 */}
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-yellow-500">⭐ {thumb.rating.toFixed(1)}</span>
            <span className="text-sm text-gray-500">({thumb.reviewsCount} 人已評分)</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-2">
            {thumb.tags.map(tag => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 bg-gray-200 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" size="sm" onClick={openReview} className="hover:bg-blue-50">
            Review
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onGallery(thumb.id)}
            className="hover:bg-secondary/10"
          >
            Gallery
          </Button>
        </CardFooter>
      </Card>

      {/* 評分 Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review “{thumb.title}”</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>請給予星級評分：</p>
            <StarRating score={currentRating}  />
            {/* onChange={setCurrentRating} */}
          </div>
          <DialogFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={closeReview} className="hover:bg-gray-100">
              取消
            </Button>
            <Button onClick={handleSubmit} className="hover:bg-blue-600/90">
              提交
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}


// 在 Page 裡使用
// Mock data with added `deadline` field (ISO 8601 format)
const mockThumbnails: Thumbnail[] = [
  {
    id: "1",
    imageUrl: "/thumbnail1.png",
    title: "Sunset Beach",
    author: { name: "Alice", avatarUrl: "/avatars/alice.png" },
    rating: 4.5,
    reviewsCount: 12,
    tags: ["Tech", "Science"],
    deadline: "2025-06-20T23:59:59Z",
  },
  {
    id: "2",
    imageUrl: "/thumbnail2.png",
    title: "Mountain View",
    author: { name: "Bob", avatarUrl: "/avatars/bob.png" },
    rating: 3.8,
    reviewsCount: 8,
    tags: ["Gaming", "History"],
    deadline: "2025-06-18T23:59:59Z",
  },
  {
    id: "3",
    imageUrl: "/thumbnail3.png",
    title: "City Lights",
    author: { name: "Carol", avatarUrl: "/avatars/carol.png" },
    rating: 4.9,
    reviewsCount: 20,
    tags: ["Art", "History"],
    deadline: "2025-07-01T23:59:59Z",
  },
];


import { useRouter } from "next/navigation";

const ALL_TAGS: Tag[] = ["Tech", "Science", "History", "Art", "Gaming"];

export default function ReviewThumbnailsPage() {
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const router = useRouter()

  const toggleTag = (tag: Tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  // 根據 selectedTags 過濾縮圖
  const filteredThumbnails = useMemo(() => {
    if (selectedTags.length === 0) return mockThumbnails
    return mockThumbnails.filter(thumb =>
      thumb.tags.some(tag => selectedTags.includes(tag))
    )
  }, [selectedTags])

  const handleGallery = (id: string) => {
    console.log("Go to gallery for", id)
    router.push("/helpothers")
  }
  const handleReviewSubmit = (id: string, rating: number) => {
    console.log("Submit review:", id, rating)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Community Thumbnails</h1>

      {/* Tag 篩選器 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ALL_TAGS.map(tag => {
          const isSelected = selectedTags.includes(tag)
          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full border transition
                ${isSelected
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
                }`}
            >
              {tag}
            </button>
          )
        })}
      </div>

      {/* Filter bar */}
      <div className="flex items-center space-x-4 mb-6">
        <button className="px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition">
          Trending
        </button>
        <button className="px-4 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition">
          Latest
        </button>
        <input
          type="text"
          placeholder="Search thumbnails..."
          className="px-3 py-1 border rounded flex-1 focus:ring focus:ring-blue-200 transition"
        />
      </div>

      {/* Thumbnail grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredThumbnails.map(thumb => (
          <ThumbnailCard
            key={thumb.id}
            thumb={thumb}
            onGallery={handleGallery}
            onSubmitReview={handleReviewSubmit}
          />
        ))}
      </div>
    </div>
  )
}
