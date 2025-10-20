//actions/upstashredis/load-page-translation.ts
"use server"
import { redis } from './redis'
import { PageTranslations } from '@/i18n/interface'
import { GetTranslationFromsupabase } from '../supabase/supabase-page-translation'

export async function LoadPageTranslation(
  page_title: string,
  locale: string,
  fallback = true
): Promise<{
  found: boolean
  content: PageTranslations;
  version?: number;
  locale: string
  from: 'redis' | 'supabase' | null
  fallback?: boolean
}> {
  // 🔧 Redis key 改成不含 version，因為要先查出最新 version
  const baseKey = `pagetranslation:${page_title}:${locale}`;

  // ✅ 1. 試著抓出最新版本號
  const versionKey = `${baseKey}:version`;
  const currentVersion = await redis.get(versionKey);

  if (currentVersion) {
    const versionedKey = `${baseKey}:v${currentVersion}`;
    const data = await redis.get(versionedKey);

    if (data) {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      return {
        found: true,
        content: parsed,
        version: Number(currentVersion),
        locale,
        from: 'redis'
      };
    }
  }

  // ✅ 2. Supabase fallback
  const { success, data: supaData } = await GetTranslationFromsupabase(page_title);
  if (success && supaData?.translations?.locales) {
    const localeMap = supaData.translations.locales as Record<string, PageTranslations>;
    const version = supaData.version ?? 1; // 預設版本

    await Promise.all(
      Object.entries(localeMap).map(([lang, content]) => {
        const versionedKey = `pagetranslation:${page_title}:${lang}:v${version}`;
        const versionRefKey = `pagetranslation:${page_title}:${lang}:version`;
        const contentWithVersion = { ...content, version };

        return Promise.all([
          redis.set(versionedKey, JSON.stringify(contentWithVersion), { ex: 3600 }),
          redis.set(versionRefKey, version, { ex: 3600 }) // 儲存版本號 reference
        ]);
      }).flat()
    );

    const selected = localeMap[locale] || localeMap['en'];
    return {
      found: !!selected,
      content: {
        ...selected,
        
      },
      version,
      locale: selected ? locale : 'en',
      from: 'supabase',
      fallback: !localeMap[locale]
    };
  }

// ✅ 3. Fallback Redis 英文
if (fallback && locale !== 'en') {
  const fallbackVersion = await redis.get(`pagetranslation:${page_title}:en:version`);

  if (fallbackVersion && typeof fallbackVersion === 'string') {
    const fallbackKey = `pagetranslation:${page_title}:en:v${fallbackVersion}`;
    const fallbackData = await redis.get(fallbackKey);

    if (fallbackData && typeof fallbackData === 'string') {
      return {
        found: true,
        content: JSON.parse(fallbackData),
        version: Number(fallbackVersion),
        locale: 'en',
        from: 'redis',
        fallback: true
      };
    }
  }
}

  // ❌ 4. 都沒找到
  return {
    found: false,
    content: {} as PageTranslations,
    locale,
    from: null
  };
}
