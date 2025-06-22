import mongoose from "mongoose";
import { string } from "zod";

const chatSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    supabase_user_work_id: {
        type: String,      // ✅ 存原始的 Supabase UserWork ID
        required: false,   // 有些 chat 可能是自由對話
        default: null,
    },
    title: {
        type: String,
        required: true

    },
    messages: {
        type: Array,
        default: []

    },
    imageUrl: {
        type: String,
        required: false
    }
},
    { timestamps: true }

)

const ChatModel = mongoose.models.chats || mongoose.model('chats', chatSchema);
export default ChatModel