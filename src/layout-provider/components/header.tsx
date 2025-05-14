"use client";
import React from 'react'
import userGlobalStore, {IUserGlobalStore} from '@/app/global-store/users-store';

// import { Button } from '@/components/ui/button'


export default function Header() {
    //const [openMenuItems, setOpenMenuItems] = React.useState(false);
    const user = userGlobalStore() as IUserGlobalStore;

    return (
        <div className="bg-primary p-5 flex justify-between items-center">
            <div className='p-2 rounded-full flex items-center  bg-white'>
                <img
                    src="/globe.svg"
                    className='w-10 h-10 object-contain' />
            </div>
            <div className='flex items-center gap-5'>
                <h1 className="text-sm text-white">{user.theUser?.username}</h1>
            </div>

        </div>
    )
};
