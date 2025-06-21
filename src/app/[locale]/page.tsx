"use server";

import { loadUserData } from '@/actions/upstashredis/load-user';
import { auth } from '@clerk/nextjs/server'
import PageContent from '../pagecontent';
export default async function HomePage() {
  const { userId } = await auth()
  let content = null;

 if (userId) {
    const result = await loadUserData(userId);
    content = result.content;
    if (!content) return <p>Failed Loading User Data</p>;
    console.log("loaded user data", content);
  } else {
    return <p>User not logged in</p>
  }

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-black text-white">
      {/* 標題 */}               
      <PageContent/>     
    </div>
  );
}