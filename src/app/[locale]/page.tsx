"use client";

import {useTranslations} from 'next-intl';
import { UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { getClerkUserFromSupabase } from '@/actions/supabaseUser';


export default function HomePage() {
  const t = useTranslations();
  return (
    <div>
      <h1>{t('greeting')}</h1>      
    </div>
  );
}