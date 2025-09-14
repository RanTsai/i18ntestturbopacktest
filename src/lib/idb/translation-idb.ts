// lib/idb/translation-idb.ts
import { openDB } from 'idb';
import { PageTranslations } from '@/i18n/interface';

export interface CachedTranslation {
  version: number;
  content: PageTranslations;
}

const DB_NAME = 'translation-db';
const STORE_NAME = 'translations';

async function getDB() {
  return await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

export async function getTranslationFromIDB(key: string): Promise<CachedTranslation  | null> {
  const db = await getDB();
  return (await db.get(STORE_NAME, key)) ?? null;
}

export async function setTranslationToIDB(key: string, value: CachedTranslation ): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, value, key);
}

export async function clearAllTranslationsFromIDB(): Promise<void> {
  const db = await getDB();
  await db.clear(STORE_NAME);
  console.log("[IDB] translation-db cleared");
}