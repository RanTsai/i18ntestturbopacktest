"use server";

import PageContent from '../pagecontent';

export default async function HomePage() {
  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-black text-white">
      {/* 標題 */}
      <PageContent />
    </div>
  );
}