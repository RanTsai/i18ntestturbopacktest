"use server";
import { getTranslations } from 'next-intl/server';

export async function getCommonTranslations() {
    const t = await getTranslations("common");
    const translations = {
    greeting: t('greeting'),
    signin: t('signin'),
    signup: t('signup'),
    signout: t('signout'),
  };
  return translations;
}