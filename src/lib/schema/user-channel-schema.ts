
export interface ITags {
    label: string;
    language: string;
}

export interface ITarget_audience {
    name: string;
    profile_pic: string;
    bio: string;
}

export interface Iai_avatar {
    name: string;
    profile_pic: string;
    bio: string;
}

export interface IGoalSetting {
    known_for: string;
    visual_mood: string[];
    current_goal: string;
    visual_style: string[];
    channel_niche: string[];
    target_audience: string;
}


export interface IUserChannel {
    created_at: string;
    is_active: boolean;
    deleted_by: string;
    status: string; //for displaying latest version
    platform: string;
    art_type: string;
    version: string;
    goal_setting: string; //Store as JSONB in Supabase
    logo: string;
    link: string; //Store as JSONB in Supabase
    art_sub_type: string;
    tags: ITags[] | null; //Store as JSONB in Supabase
    target_audence: ITarget_audience[] | null;
    description: string;
    ai_avatar: Iai_avatar | null; //Store as JSONB in Supabase
    updated_by: string;
    channel_name: string;
    language: string;
    is_public: boolean;
    
    clerk_user_id: string;
    updated_at: string;
    deleted_at: string | null;
    niche:string | null;
};
