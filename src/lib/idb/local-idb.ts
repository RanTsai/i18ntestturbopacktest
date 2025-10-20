// lib/idb/create-idb-store.ts
import { openDB, IDBPDatabase } from 'idb'

/**
 * 建立一個泛型 IDB Store 封裝，支援 get / set / delete / clear 等操作
 * 並具備「自我修復」：若目標 object store 尚不存在，會自動升版建立。
 *
 * @param storeName - Object Store 名稱
 * @param dbName - 資料庫名稱，預設為 'local-app-db'
 * @param defaultVersion - 預設資料庫版本
 */

export function createIDBStore<T>(
  storeName: string,
  dbName = 'local-app-db',
  defaultVersion = 1
) {
  async function getLatestVersion(): Promise<number> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(dbName)
      req.onsuccess = () => {
        const ver = req.result.version
        req.result.close()
        resolve(ver)
      }
      req.onupgradeneeded = () => {
        // 沒有 DB 時會走這裡
        resolve(defaultVersion)
      }
      req.onerror = () => reject(req.error)
    })
  }

  async function getDBEnsured(): Promise<IDBPDatabase> {
    let version = await getLatestVersion()
    let db = await openDB(dbName, version, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(storeName)) {
          //console.log(`🔨 Creating object store: ${storeName}`)
          db.createObjectStore(storeName)
        }
      },
    })

    if (!db.objectStoreNames.contains(storeName)) {
      db.close()
      version++
      db = await openDB(dbName, version, {
        upgrade(upgradeDB) {
          if (!upgradeDB.objectStoreNames.contains(storeName)) {
            //console.log(`🔨 Creating object store: ${storeName}`)
            upgradeDB.createObjectStore(storeName)
          }
        },
      })
    }
    return db
  }

  return {
    /** 根據 key 讀取資料 */
    async get(key: string): Promise<T | null> {
      const db = await getDBEnsured()
      return (await db.get(storeName, key)) ?? null
    },

    /** 寫入資料 */
    async set(key: string, value: T): Promise<void> {
      const db = await getDBEnsured()
      await db.put(storeName, value, key)
    },

    /** 刪除單一資料 */
    async delete(key: string): Promise<void> {
      const db = await getDBEnsured()
      await db.delete(storeName, key)
    },

    /** 清空整個 store（不會刪除 store） */
    async clear(): Promise<void> {
      const db = await getDBEnsured()
      await db.clear(storeName)
      //console.log(`[IDB] Cleared store: ${storeName}`)
    },

    /** 取得所有 key（用於 debug 或清理） */
    async keys(): Promise<IDBValidKey[]> {
      const db = await getDBEnsured()
      return await db.getAllKeys(storeName)
    },

    /** 檢查是否存在某 key */
    async has(key: string): Promise<boolean> {
      const db = await getDBEnsured()
      return (await db.getKey(storeName, key)) !== undefined
    },
  }
}
