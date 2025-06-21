"use server";
import UserFeedbackList, { UserReview } from "@/components/ui/feedback/user-feedback-list";
import FAQSection from '@/components/ui/faq/faq-section';
import { loadUserData } from '@/actions/upstashredis/load-user';
import { auth } from '@clerk/nextjs/server'

export default async function HomePage() {
  const { userId } = await auth()

  if (userId) {
    const { content } = await loadUserData(userId)

    if (!content) return <p>Failed Loading User Data</p>
  }
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


  return (
    <>
      <div className="flex flex-col items-center justify-between min-h-screen">
        <div>
          <h1 className='font-bold justify-center text-red-500'>Make Thumbnails That Gets Clicks!</h1>
        </div>
        <div className="p-10 text-white">
          <UserFeedbackList reviewers={reviewers} />
        </div>
        <div>
          <FAQSection />
        </div>
      </div>
    </>
  );
}