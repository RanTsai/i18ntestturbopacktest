import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        clerkUserId: {
            type: String,
            required: true,
        },
        supabaseUserId:{
            type: String,
            required: true,
        },
        publicUserId:{
            type: String,
            required: true,
        }
    },
    { timestamps: true }
);


const UserModel = mongoose.models.users || mongoose.model('users', userSchema);
export default UserModel;