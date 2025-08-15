import { ITags, ITarget_audience } from "./user-channel-schema"
import { FormSchema, Question } from "./questionaire-schema";

export interface IHumanReview {
    human_review_id?:number;
    created_at: string;
    clerk_user_id?: string;
    supabase_user_id?: number;
    project_summary: string; 
    review_rating?: string; 
    questionaire: Question[];
    channel_name: string;
    channel_logo: string; //URL
    reviewer: string[];
    deadline: string | null; 
    creator_message_to_reviewer: string;
    tags: string[]; 
    target_audience: ITarget_audience[] | null;
    credit_reward: number;
    compare_project_version: number;
    updated_by?: string;
    language: string;
    is_closed: boolean;
    is_deleted: boolean;
    is_public: boolean;
    deleted_by: string;
    status: string;
    wanted_review_count: number;
    rating_count: number;
    view_count: number;
    thumbnails: string[];
    title:string;
    niche:string;
};

export interface IFollowingChannel{
    clerk_user_id:string;
    created_at: string;
    user_channel_id:number;
    channel_name: string;
    logo:string;
    platform:string;
}

export interface IHumanAnswer {
    human_answer_id?:number;
    human_review_id?:number;
    created_at: string;
    reviewer_clerk_id?: string;
    questionaire: Question[];
    message_to_creator: string;
    credit_reward: boolean;
    is_deleted: boolean;
    deleted_at: string;
    is_public: boolean;
    deleted_by: string;
    selected_work: string;  
    follow_creator:boolean;
    creator_support_credit:number;
};


export type IHumanAnswerWithProfile = IHumanAnswer & {
  rater?: {
    username: string | null;
    profile_pic_url: string | null;
  };
};
