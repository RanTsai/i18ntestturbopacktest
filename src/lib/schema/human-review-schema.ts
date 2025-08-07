import { ITags, ITarget_audience } from "./user-channel-schema"
import { FormSchema, Question } from "./questionaire-schema";

export interface IHumanReview {
    human_review_id?:number;
    created_at: string;
    clerk_user_id?: string;
    supabase_user_id?: number;
    project_summary: string; //for displaying latest version
    review_rating?: string; //JSONB
    questionaire: Question[];
    channel_name: string;
    channel_logo: string; //Store as JSONB in Supabase
    reviewer: string[];
    deadline: string | null; //Store as JSONB in Supabase
    creator_message_to_reviewer: string;
    tags: string[]; //Store as JSONB in Supabase
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



