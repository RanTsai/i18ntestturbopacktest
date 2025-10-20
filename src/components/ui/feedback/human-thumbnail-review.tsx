"use client";

import Image from "next/image";
import React from "react";

interface ThumbnailFeedback {
    name: string;
    thumbnailTitle: string;
    imgurl?: string; // Optional, if you want to include an image
    rating: number; // e.g., out of 5
    comment: string;
    timeAgo: string;
}

const dummyThumbnailFeedbacks: ThumbnailFeedback[] = [
    {
        name: "Alex Smith",
        thumbnailTitle: "History's Forgotten Wars",
        imgurl: "/thumbnail1.png",
        rating: 5,
        comment: "Absolutely eye-catching! The contrasting colors make the thumbnail pop, and the bold text grabs attention. I’d definitely click on this!",
        timeAgo: "2 days ago"
    },
    {
        name: "Jessica Lee",
        thumbnailTitle: "Lost Cities: The Untold Stories",
        imgurl: "/thumbnail2.png",
        rating: 4,
        comment: "The title is super engaging and the visuals make me curious. Maybe adding a stronger call-to-action would make it even better.",
        timeAgo: "5 days ago"
    },
    {
        name: "John Doe",
        thumbnailTitle: "The Day Everything Changed",
        imgurl: "/thumbnail3.png",
        rating: 3,
        comment: "The thumbnail is clear, but I feel like it could use more contrast or brighter colors to stand out more on social media feeds.",
        timeAgo: "1 week ago"
    }
];

export default function DummyThumbnailFeedback() {
    return (
        <div className="my-12 p-6 bg-gray-900 rounded-lg shadow-lg max-w-3xl mx-auto text-white">
            <h2 className="text-2xl font-bold mb-4">User Feedback on Thumbnails</h2>
            <div className="space-y-4">
                {dummyThumbnailFeedbacks.map((feedback, index) => (
                    <div key={index} className="p-4 border border-gray-700 rounded">
                        <div className="flex justify-between items-center mb-1">
                            <h3 className="font-semibold text-lg">{feedback.name}</h3>
                            <span className="text-xs text-gray-400">{feedback.timeAgo}</span>
                        </div>
                        <Image src={feedback.imgurl || "/v36.png"} alt={feedback.thumbnailTitle} width={400}
                            height={225} className="w-full h-auto rounded mb-2" />
                        <p className="text-sm text-gray-400 italic">
                            Thumbnail: {feedback.thumbnailTitle}
                        </p>

                        <p className="text-yellow-400 font-bold">Rating: {feedback.rating} / 5</p>
                        <p className="text-gray-300 mt-1">{feedback.comment}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
