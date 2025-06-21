"use server";
import MongoolseDB from "./mongooesedb";
import { currentUser } from "@clerk/nextjs/server";
import UserModel from "./user-mongoose-model";

MongoolseDB();
export const saveAndGetCurrentUser = async() => {
    try {
        await MongoolseDB();
        const user = await currentUser();
        const existingUser = await UserModel.findOne({
            clerkUserId: user?.id
        })

        if(existingUser){
            return {
                success:true,
                data: JSON.parse(JSON.stringify(existingUser))
            }
        }
        const userObj = {
            name: user?.firstName! + user?.lastName,
            email:user?.emailAddresses[0].emailAddress,
            clerkUserId: user?.id
        }

        const newUser = await UserModel.create(userObj);

            return {
                success:true,
                data: JSON.parse(JSON.stringify(newUser))
            }
    } catch (error:any) {
        return{
            success:false,
            message:error.message
        }
    }

}