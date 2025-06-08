"use client";
import React from 'react';
import { UserButton } from '@clerk/nextjs';
import userGlobalStore, { IUserGlobalStore } from '@/lib/global-store/users-store';
import toast from 'react-hot-toast';
import Spinner from '@/components/ui/spinner';
import { useTranslations } from 'next-intl';
import { useUser } from '@clerk/nextjs';

export default function UserDashboard() {
  const t = useTranslations();
  const { theUser } = userGlobalStore() as IUserGlobalStore;
  const { user } = useUser();

  return (
    <>
      <div>

      </div>
    </>
  )
};