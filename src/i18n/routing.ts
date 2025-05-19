//	No use server or use client, pure JS、shared
import {defineRouting} from 'next-intl/routing';
 
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'zh', 'ja'],
 
  // Used when no locale matches
  defaultLocale: 'en'
});