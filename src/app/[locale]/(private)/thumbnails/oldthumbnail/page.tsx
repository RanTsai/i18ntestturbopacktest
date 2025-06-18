"use client";
import React from 'react'
import { GetUserWorkFromSupabseWithWorkID } from '@/actions/supabase/supabaseUserWork';
import Spinner from '@/components/ui/spinner';
import ReviewCard from '@/components/ui/review/reviewcard';
import { UserWork } from '@/lib/schema/userwork-schema';
import UserWorkGlobalStore from '@/lib/global-store/user-work-store';
import { User } from '@clerk/nextjs/server';
import { set } from 'mongoose';
import Link from 'next/link';
import ThumbnailDecisionReport from './thumbnail-decision-report';

export default function page() {

    const [loading, setLoading] = React.useState(true);
    //const [workData, setWorkData] = React.useState<UserWork | null>(null);
    const {selectedWork, setSelectedWork} = UserWorkGlobalStore() as any;

    console.log("Loading work data...");

    React.useEffect(() => {
        const fetchData = async () =>             
            {
                console.log("fetching work data...");
            try {
                setLoading(true);
                const res = await GetUserWorkFromSupabseWithWorkID({ user_work_id: 30 });
                if (res.success && res.data) {
                    console.log("Fetched work data:", res.data);
                    //setWorkData(res.data);
                    setSelectedWork(res.data);
                }else{
                    console.error("Failed to fetch work data:", res.message);
                    //setWorkData(null);
                    setSelectedWork(null);
                }
            } catch (error: any) {
                console.error("Error fetching work data:", error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    return (
        <>
        <ThumbnailDecisionReport />
        <div>
            {
                loading ? (
                    <div className="flex flex-col items-center justify-center space-y-2" >
                        <Spinner height={50} />
                        <p className="text-sm text-gray-400 text-center">🤖 正在分析縮圖與標題中，請稍候...</p>
                    </div>
                ) : (
                    selectedWork && (
                        <ReviewCard
                            thumbnailUrl={selectedWork.image_url || '/placeholder-thumbnail.png'}
                            title={selectedWork.title}
                            score={selectedWork.ai_score.clickability}
                            aspects={[
                                selectedWork.ai_score.clickability,
                                selectedWork.ai_score.curiosity,
                                selectedWork.ai_score.brightness,
                                selectedWork.ai_score.relevance,
                                selectedWork.ai_score.emotion
                            ]}
                            aiMarkdown={`### Overall Impression${selectedWork.ai_comment}`}
                        />
                    )
                )
            }
            </div>
            <div>
                <Link href="/thumbnails/differentdevices" className="text-blue-500 hover:underline">Click here</Link>
            </div>
        </>
        )
}

