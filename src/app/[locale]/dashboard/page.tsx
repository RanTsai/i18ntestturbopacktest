"use server";
import React from 'react';
import { getCommonTranslations } from '../../../i18n/clienttranslation';
import { currentUser } from '@clerk/nextjs/server';
import userGlobalStore , { IUserGlobalStore } from '@/app/global-store/users-store';
import UserDashboard from './userdashboard';


export default async function Page() {
  //const { user } = userGlobalStore() as IUserGlobalStore;
  const translations = await getCommonTranslations();
  //const user = await currentUser();

  // const plainUser = user
  //   ? {
  //     id: user.id,
  //     email: user.emailAddresses?.[0]?.emailAddress || null,
  //     username: user.username,
  //     imageUrl: user.imageUrl,
  //   }
  //   : null;

  return (
    <UserDashboard t={translations} />
  )
}