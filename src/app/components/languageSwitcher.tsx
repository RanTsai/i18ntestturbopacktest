'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';

const locales = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  // ✅ 將來要擴充這裡就好
];

export default function LanguageSwitcher() {
    const currentLocale = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
  
    const localeCodes = locales.map(({ code }) => code).join('|');
    const basePath = pathname.replace(new RegExp(`^/(${localeCodes})(/|$)`), '/');
    const cleanPath = basePath === '/' ? '' : basePath;
  
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedLocale = e.target.value;
      startTransition(() => {
        router.push(`/${selectedLocale}${cleanPath}`);
      });
    };
  
    return (
      <select
        className="p-2 border rounded"
        value={currentLocale}
        onChange={handleChange}
        disabled={isPending}
      >
        {locales.map(({ code, label }) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
    );
  }