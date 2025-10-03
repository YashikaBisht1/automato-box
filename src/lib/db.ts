import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface StartupAIBoxDB extends DBSchema {
  logos: {
    key: string;
    value: {
      id: string;
      company: string;
      blob: Blob;
      timestamp: number;
    };
  };
}

let db: IDBPDatabase<StartupAIBoxDB> | null = null;

export const initDB = async () => {
  if (db) return db;
  
  db = await openDB<StartupAIBoxDB>('startup-ai-box', 1, {
    upgrade(database) {
      if (!database.objectStoreNames.contains('logos')) {
        database.createObjectStore('logos', { keyPath: 'id' });
      }
    },
  });
  
  return db;
};

export const saveLogo = async (company: string, blob: Blob) => {
  const database = await initDB();
  const id = `logo_${Date.now()}`;
  
  await database.put('logos', {
    id,
    company,
    blob,
    timestamp: Date.now(),
  });
  
  return id;
};

export const getLogo = async (id: string) => {
  const database = await initDB();
  return await database.get('logos', id);
};

export const getAllLogos = async (company?: string) => {
  const database = await initDB();
  const allLogos = await database.getAll('logos');
  
  if (company) {
    return allLogos.filter(logo => logo.company === company);
  }
  
  return allLogos;
};

export const deleteLogo = async (id: string) => {
  const database = await initDB();
  await database.delete('logos', id);
};
