"use client";
import React from 'react'
import ReviewCard from '@/components/ui/review/reviewcard';
import UserWorkGlobalStore from '@/lib/global-store/user-work-store';
import ProfileSettings from './profile-settings';

export default function page() {

    const { selectedWork, setSelectedWork } = UserWorkGlobalStore() as any;

    console.log("UserWorkGlobalStore selectedWork:", selectedWork);
    const loading = false;

    return (
        <>
        <ProfileSettings/>

        </>)
}

