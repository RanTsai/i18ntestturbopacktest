import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    title: {
        type: String,
        required: true

    },
    messages: {
        type: Array,
        default: []

    },
    imageUrl:{
        type: String,
        required: false
    }
},
    { timestamps: true }

)

const ChatModel = mongoose.models.chats || mongoose.model('chats', chatSchema);
export default ChatModel