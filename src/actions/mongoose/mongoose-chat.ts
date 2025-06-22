'use server';

import ChatModel from "./chat-mongoose-model";
import { saveAndGetCurrentUser } from "./mongoose-user";

export const createNewChat = async (
    messages: any[],
    title: string,
    supabaseUserWorkId?: string // ✅ 可選的 Supabase 縮圖 ID
) => {
    const { data: user } = await saveAndGetCurrentUser();

    const payload: any = {
        user: user._id,
        messages,
        title,
    };

    // ✅ 若有提供 Supabase UserWork ID，就加入 payload
    if (supabaseUserWorkId) {
        payload.supabase_user_work_id = supabaseUserWorkId;
    }

    try {
        const response = await ChatModel.create(payload);

        return {
            data: JSON.parse(JSON.stringify(response)),
            success: true,
        };
    } catch (error: any) {
        return {
            message: error.message || 'Something went wrong while saving the chat',
            success: false,
        };
    }
};

export const getChatsByUserId = async () => {
    try {
        const { data: user } = await saveAndGetCurrentUser();

        console.log("MongoUser", user);

        const response = await ChatModel.find({ user: user._id });
        //const response = await ChatModel.find({ user: "683434c0ee26b7a6685eda9e" });

        console.log("getChatsByUserId response", JSON.parse(JSON.stringify(response)));
        console.log("完整 response:", JSON.stringify(response, null, 2));

        return {
            data: JSON.parse(JSON.stringify(response)),
            success: true,
        };

    } catch (error: any) {
        return {
            message: error.message || 'Something went wrong while getting the chats',
            success: false
        };
    }
};

export const getChatById = async (chatId: string) => {
    try {
        const chat = await ChatModel.findById(chatId);
        //console.log("getChatById response", JSON.parse(JSON.stringify(chat)));
        return { data: JSON.parse(JSON.stringify(chat)), success: true };
    } catch (error: any) {
        return { message: error.message, success: false };
    }
};


export const getChatsByUserWorkId = async (supabaseUserWorkId: string): Promise<{ data?: any; success: boolean; message?: string }> => {
    try {
        console.log("loading chat by work ID", supabaseUserWorkId);
        const chat = await ChatModel.find({ supabase_user_work_id: supabaseUserWorkId });
        console.log("loaded chats by work ID", chat);

        return { data: JSON.parse(JSON  .stringify(chat)), success: true };
    } catch (error: any) {
        return { message: error.message, success: false };
    }
};

export const updateChat = async ({ chatId = "", messages = [] }: { chatId: string, messages: any[] }) => {
    try {
        const response = await ChatModel.findByIdAndUpdate(chatId, { messages }, { new: true });
        return {
            data: JSON.parse(JSON.stringify(response)),
            success: true,
        };
    } catch (error: any) {
        return {
            message: error.message || 'Something went wrong while updating the chats',
            success: false
        };
    }
};

export const deleteChat = async (chatId: string) => {
    try {
        const response = await ChatModel.findByIdAndDelete(chatId);
        return {
            data: JSON.parse(JSON.stringify(response)),
            success: true,
        }
    } catch (error: any) {
        return {
            message: error.message || 'Something went wrong while deleting the chat',
            success: false
        }
    }
}