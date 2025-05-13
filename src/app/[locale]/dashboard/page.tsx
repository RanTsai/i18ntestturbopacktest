import React from 'react';
import { getTranslations } from 'next-intl/server';
import { currentUser } from '@clerk/nextjs/server';
import { UserButton } from '@clerk/nextjs';
import { getClerkUserFromSupabase } from '@/actions/supabaseUser';

export default async function Page() {  
  const t = await getTranslations();
  const user = await currentUser();
  console.log(user);

  const supabaseUser = await getClerkUserFromSupabase();
  console.log(supabaseUser);

  return (
    <div>
      <p>{t('greeting')}</p>   
      <p>{t('signin')}</p>
      <p>{t('signup')}</p>
      <p>{t('signout')}</p>   

      <h1>user dashboard</h1>
            <UserButton />

            <div className="flex flex-col gap-2">
                <h1>Clerk User ID: {user?.id}</h1>
                <h1>Clerk User Email: {user?.emailAddresses[0].emailAddress}</h1>
                <h1>Clerk User Name: {user?.username}</h1>
                <h1>Clerk Profile Picture:</h1>
                <img src={user?.imageUrl}
                    alt="User Profile Picture"
                    className="w-20 h-20 rounded-full" />

            </div>

            <div className="flex flex-col gap-2">
                <h1>Supabase User ID: {user?.id}</h1>
                <h1>Supabase User Email: {user?.emailAddresses[0].emailAddress}</h1>
                <h1>Supabase User Name: {user?.username}</h1>
                <h1>Supabase Profile Picture:</h1>
                <img src={user?.imageUrl}
                    alt="User Profile Picture"
                    className="w-20 h-20 rounded-full" />

            </div>
    </div>
  );
}