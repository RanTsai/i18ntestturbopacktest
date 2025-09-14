//app/[locale]/reviewothershome/layout.tsx
"use server";
import ReviewOthersSideBar from './review-others-sidebar';

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
            <div className="flex flex-col h-screen bg-background text-foreground ">
                {/* 上方 TopNavigationBar */}

                <div className="flex flex-1 ">
                    {/* 左側 Sidebar */}
                    <ReviewOthersSideBar/>

                    {/* 中間區域：Topbar + children */}
                    <div className="flex flex-col flex-1 ">
                        <main className="flex-1 p-4">{children}</main>
                    </div>
                </div>
            </div>
    );
}