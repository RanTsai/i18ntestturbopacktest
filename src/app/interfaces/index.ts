export interface IUser{
    id: string;
    clerk_user_id: string;
    username: string;
    nickname: string;
    email: string;
    bio: string;
    last_login_at: string; //Use format converter in display
    last_update: string; //Use format converter in display
    credit_balance: number;
    is_deleted: boolean,
    is_active: boolean,
    profile_pic: string;
    language: string;
}
