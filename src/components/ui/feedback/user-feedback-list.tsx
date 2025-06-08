import React from "react";
import UserFeedback from "./user-feedback";

export interface UserReview {
  name: string;
  rating: number;
  comment: string;
  favorite: string;
  timeAgo: string;
}

export default function UserFeedbackList({
  reviewers,
}: {
  reviewers: UserReview[];
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-2">Recent Comments</h2>
      {reviewers.map((reviewer, index) => (
        <UserFeedback key={index} {...reviewer} />
      ))}
    </div>
  );
}
