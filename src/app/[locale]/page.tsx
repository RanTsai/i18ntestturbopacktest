"use client";

import {useTranslations} from 'next-intl';


export default function HomePage() {
  const t = useTranslations();
  return (
    <div>
      <h1>{t('common.greeting')}</h1>      
    </div>
  );
}