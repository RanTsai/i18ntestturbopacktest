// export interface IChannel {
//     id: string;
//     title: string;
//     thumbnail: string;
//     channelLogo: string;
//     channelName: string;
//     views: string;
//     uploadedAt: string;
//     length: string;
// }

export interface ITags {
    label: string;
    language: string;
}

export interface ITarget_audence {
    name: string;
    profile_pic: string;
    bio: string;
}

export interface Iai_avatar {
    name: string;
    profile_pic: string;
    bio: string;
}

export interface IUserChannel {
    created_at: string;
    is_active: boolean;
    deleted_by: string;
    status: string; //for displaying latest version
    platform: string; 
    art_type: string;
    version: string;
    logo: string; 
    link: string; //Store as JSONB in Supabase
    art_sub_type: string;
    tags:ITags[] | null; //Store as JSONB in Supabase
    target_audence: ITarget_audence[] | null;
    description:string;
    ai_avatar:Iai_avatar | null; //Store as JSONB in Supabase
    updated_by: string;
    channel_name: string;
    language: string;
    is_public: boolean;
    user_channel_id: string;
    public_user_id: string;
    clerk_user_id: string;
    updated_at: string;
    deleted_at:string | null;
};
