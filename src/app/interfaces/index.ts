import { IVersions } from "@/lib/schema/userwork-schema";

export interface IUser{
    //supabase_user_id: number;
    sign_up_date: string;
    last_login_at: string; //Use format converter in display
    name: string;
    username: string;
    email: string;
    credit_balance: number;
    bio: string;
    last_updated: string; //Use format converter in display
    language: string;
    subscription_status_id:number;
    clerk_user_id: string;
    user_role_id:number;
    active_plan_id:number;
    surname:string;
    profile_pic_url: string;
    is_active: boolean;
    is_deleted: boolean;
    public_user_id:string;
};
export interface IAIScore{
    clickability: number,
    curiosity: number,
    brightness: number,
    relevance: number,
    emotion: number
};

export interface IUserWork{
    //supabase_user_id: number;
    user_work_id: number;
    created_at: string;
    image_url: string; //for displaying latest version
    title: string; 
    description: string;
    ai_comment: string;
    
    ai_score: IAIScore | null; //Store as JSONB in Supabase
    view_count: number;
    rating_count:number;
    public_id: string;
    language:string;
    versions:IVersions | null; //Store as JSONB in Supabase
    clerk_user_id:string;
};


export interface IUserSettings{
    user_setting_id: number;
    supabase_user_id: string;
    is_saving_chat_history: boolean;
    is_auto_renew_subscription: boolean;
    language: string;
    stripe_status:string;
    last_updated_at:string;
};

export interface IUserCreditHistory{
    user_credit_history_id: number;
    created_at:string;
    action_type: string;
    debit_amount: number; 
    credit_amount: number;
    description: string;
    balance: number;
    user_purchase_id: string;
    user_usage_id: string;
    supabase_user_id:string;
    public_id:string;
};

export interface IUserPurchaseHistory{
    user_purchase_id: number;
    created_at:string;
    supabase_user_id: number;
    subscription_plan_id: Number;
    amount: number;
    currency: string;
    credit_amount: number;
    balance: number; //place holder, need to see if required    
    public_id: string;
};

export interface IUserUsageHistory{
    user_usage_id: number;
    created_at:string;
    supabase_user_id: string;
    action_type:string;
    credit_consumed: number;
    user_work_id:number;
    feature_cost: number;
    subscription_feature_id: number; //place holder, need to see if required
    public_id: string;
};

export interface IProduct{
    product_id: number;
    language:string;
    period: string;
    credit:number;
    comment: string;
    price:number;
    currency: string;
    product_feature_id: number; //??To check if it works
    is_active:boolean;
    disabled_at:string;
    created_at:string;
    product_revenue_type:string;
    product_name:string;
    product_translated_name:string;
    product_description:string;
    is_disabled:boolean;
    disabled_by:string;
    product_category:string;
};


