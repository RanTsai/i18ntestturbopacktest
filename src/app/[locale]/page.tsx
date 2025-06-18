"use client";

import { useTranslations } from 'next-intl';
import UserFeedbackList, { UserReview } from "@/components/ui/feedback/user-feedback-list";
import FAQSection from '@/components/ui/faq/faq-section';
import ReviewCard from '@/components/ui/review/reviewcard';
import { Radar } from 'lucide-react';
import Radarchart from '@/components/ui/review/radarchart';
import AspectBarList from '@/components/ui/review/aspectbarlist';
import Markdown from 'react-markdown';
import ThumbnailRankingBoard from '@/components/ui/review/thumbnailRankingBoard';
import DummyThumbnailFeedback from '@/components/ui/feedback/human-thumbnail-review';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
export default function HomePage() {
  const t = useTranslations();
  const reviewers: UserReview[] = [
    {
      name: "Sarah Johnson",
      rating: 5,
      comment: "The Product Launch Announcement thumbnail is absolutely stunning! The color scheme really pops and the layout makes the product the star of the show. I'd love to see more designs like this.",
      favorite: "Product Launch Announcement",
      timeAgo: "2 days ago",
    },
    {
      name: "Michael Chen",
      rating: 4,
      comment: "I really like the Eco-Friendly Product Line thumbnail. The green color scheme perfectly matches the theme, and the messaging is clear. However, I think it could use a stronger call-to-action to improve engagement.",
      favorite: "Eco-Friendly Product Line",
      timeAgo: "1 week ago",
    },
    {
      name: "Emily Rodriguez",
      rating: 3,
      comment: "The Summer Sale Collection thumbnail has great colors and energy! I think it would perform well on social media. My only suggestion would be to make the discount percentage more prominent to catch attention faster.",
      favorite: "Summer Sale Collection",
      timeAgo: "2 weeks ago",
    },
  ];

  const aspectsArray = [{
    label: "Visual",
    value: 3
  }, {
    label: "Curiosity",
    value: 3.5
  }, {
    label: "Clickability",
    value: 5
  }, {
    label: "Branding",
    value: 4
  }, {
    label: "CTR",
    value: 4
  }
  ];


  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-black text-white">
      {/* 標題 */}
      <h1 className="font-bold text-yellow-500 text-4xl my-8">
        Make Thumbnails That Get Clicks!
        <span className="font-bold text-red-500 text-6xl ml-2">For Free</span>
      </h1>


      {/* 整體排版容器 */}
      <div className="flex flex-col w-full max-w-5xl gap-6 p-4">
        <h2 className="text-2xl font-semibold text-center mb-4">
          Get Trained AI Opinions
        </h2>
        {/* 上方：左右分割 */}
        <div className="flex flex-col md:flex-row gap-4">

          {/* 左側：Thumbnail + Title */}
          <div className="flex flex-col md:w-1/2 gap-4">
            <img
              src="/v36.png"
              alt="Thumbnail Creator"
              className="w-full h-auto rounded shadow"
            />
            <input
              type="text"
              value={"How A man accidentally destroyed America's economy"}
              readOnly
              className="p-2 text-white bg-gray-800 border border-gray-700 rounded"
            />
          </div>

          {/* 右側：Radar Chart + Aspects */}
          <div className="flex flex-col md:w-1/2 gap-4">
            <div className="flex flex-col h-[300px] w-[500px] items-center"> {/* 你可以改成其他高度 */}
              <Radarchart data={[3, 3.5, 4, 5, 1]} />
            </div>
            <div className="h-[300px]">
              <AspectBarList aspects={aspectsArray} />
            </div>
          </div>
        </div>

        {/* 下方：Comment 橫跨 */}
        <div className="bg-gray-900 p-4 rounded shadow">
          <Markdown>
            {`
**Overall Impression**  
Wow! 😮 This picture looks like it's from an exciting cartoon about history! ...

**Title Strength**  
The title "An indian castle" is okay, but it's a bit plain! 😕 ...

**Thumbnail Strength**  
This picture is awesome! 👍 It's like a mini-movie scene. ...

**Synergy**  
The picture and the title are not best friends here. 🤝❌ ...

**Explanation**  
This thumbnail is super cool because it pulls you right into a story! 🎬 ...
`}
          </Markdown>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-center mb-4">
            Which one is better?
          </h2>
          <ThumbnailRankingBoard thumbnails={[]} />
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-center mb-4">
            Get Real Human Feedback
          </h2>
        </div>
        <DummyThumbnailFeedback />
        {/* 用戶回饋 */}
        <div className="p-4">
          <h2 className="text-2xl font-semibold text-center mb-4">
            What do people say?
          </h2>
          <UserFeedbackList reviewers={reviewers} />
        </div>

        <Link href="/thumbnails/uploadpage" className="flex justify-center">
          <Button className=' bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-[50px] items-center justify-center mx-auto'>
            Start
          </Button>
        </Link>

        {/* FAQ */}
        <div className="p-4">
          <h2 className="text-2xl font-semibold text-center mb-4">
            FAQ
          </h2>
          <FAQSection />
        </div>
      </div>
    </div>
  );
}