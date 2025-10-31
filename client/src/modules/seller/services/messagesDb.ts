// Lightweight IndexedDB helper for persisting seller messages locally
// Schema:
//  - store "conversations": key = conversationId, value = conversation head object
//  - store "threads": key = conversationId, value = { id, messages: Message[] }

type IDBDB = IDBDatabase | null;

let db: IDBDB = null;
const DB_NAME = 'seller_messages_db';
const DB_VERSION = 1;
const STORE_CONVERSATIONS = 'conversations';
const STORE_THREADS = 'threads';

function openDB(): Promise<IDBDatabase> {
  if (db) return Promise.resolve(db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const database = req.result;
      if (!database.objectStoreNames.contains(STORE_CONVERSATIONS)) {
        database.createObjectStore(STORE_CONVERSATIONS, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(STORE_THREADS)) {
        database.createObjectStore(STORE_THREADS, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => {
      db = req.result;
      resolve(db);
    };
    req.onerror = () => reject(req.error);
  });
}

async function tx(storeName: string, mode: IDBTransactionMode = 'readonly') {
  const database = await openDB();
  return database.transaction(storeName, mode).objectStore(storeName);
}

export async function saveConversations(conversations: any[]): Promise<void> {
  try {
    const store = await tx(STORE_CONVERSATIONS, 'readwrite');
    // Clear old entries for simplicity; these are heads only
    await clearStore(store);
    await Promise.all(conversations.map((c) => put(store, c)));
  } catch {}
}

export async function upsertConversation(conversation: any): Promise<void> {
  try {
    const store = await tx(STORE_CONVERSATIONS, 'readwrite');
    await put(store, conversation);
  } catch {}
}

export async function removeConversation(conversationId: string): Promise<void> {
  try {
    const convStore = await tx(STORE_CONVERSATIONS, 'readwrite');
    await del(convStore, conversationId);
    const threadStore = await tx(STORE_THREADS, 'readwrite');
    await del(threadStore, conversationId);
  } catch {}
}

export async function getAllConversations(): Promise<any[]> {
  try {
    const store = await tx(STORE_CONVERSATIONS, 'readonly');
    return await getAll(store);
  } catch { return []; }
}

export async function saveThread(conversationId: string, messages: any[]): Promise<void> {
  try {
    const store = await tx(STORE_THREADS, 'readwrite');
    await put(store, { id: conversationId, messages });
  } catch {}
}

export async function getThread(conversationId: string): Promise<any[] | null> {
  try {
    const store = await tx(STORE_THREADS, 'readonly');
    const val = await getOne(store, conversationId);
    return val?.messages || null;
  } catch { return null; }
}

// --- IDB helpers ---
function put(store: IDBObjectStore, value: any): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = store.put(value);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function del(store: IDBObjectStore, key: IDBValidKey): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = store.delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function clearStore(store: IDBObjectStore): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function getAll(store: IDBObjectStore): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

function getOne(store: IDBObjectStore, key: IDBValidKey): Promise<any | undefined> {
  return new Promise((resolve, reject) => {
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}


