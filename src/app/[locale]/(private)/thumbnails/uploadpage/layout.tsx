//app/[locale]/layout.tsx
"use server";
import UploadSideBar from '@/app/[locale]/(private)/thumbnails/uploadpage/upload-side-bar';

export default async function LocaleLayout({
    children,
}: {
    children: React.ReactNode;
}) {
   return (
    <div className="flex flex-col h-screen bg-background text-foreground ">
 
      <div className="flex flex-1 ">
        {/* 左側 Sidebar */}
        <UploadSideBar />

        {/* 中間區域：Topbar + children */}
        <div className="flex flex-col flex-1 ">
          <main className="flex-1 p-4">{children}</main>
        </div>
      </div>
    </div>
);


}