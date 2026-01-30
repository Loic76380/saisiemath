// Offline Storage Utility using IndexedDB and localStorage

const DB_NAME = 'MathSnipDB';
const DB_VERSION = 1;

let db = null;

// Initialize IndexedDB
export const initDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Create object stores
      if (!database.objectStoreNames.contains('snips')) {
        const snipsStore = database.createObjectStore('snips', { keyPath: 'id' });
        snipsStore.createIndex('createdAt', 'createdAt', { unique: false });
        snipsStore.createIndex('type', 'type', { unique: false });
      }

      if (!database.objectStoreNames.contains('notes')) {
        const notesStore = database.createObjectStore('notes', { keyPath: 'id' });
        notesStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      if (!database.objectStoreNames.contains('documents')) {
        const docsStore = database.createObjectStore('documents', { keyPath: 'id' });
        docsStore.createIndex('convertedAt', 'convertedAt', { unique: false });
      }

      if (!database.objectStoreNames.contains('settings')) {
        database.createObjectStore('settings', { keyPath: 'key' });
      }
    };
  });
};

// Generic CRUD operations
export const saveItem = async (storeName, item) => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);

    request.onsuccess = () => resolve(item);
    request.onerror = () => reject(request.error);
  });
};

export const getItem = async (storeName, id) => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getAllItems = async (storeName) => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

export const deleteItem = async (storeName, id) => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

// Specific storage functions
export const saveSnip = (snip) => saveItem('snips', snip);
export const getSnips = () => getAllItems('snips');
export const deleteSnip = (id) => deleteItem('snips', id);

export const saveNote = (note) => saveItem('notes', note);
export const getNotes = () => getAllItems('notes');
export const deleteNote = (id) => deleteItem('notes', id);

export const saveDocument = (doc) => saveItem('documents', doc);
export const getDocuments = () => getAllItems('documents');
export const deleteDocument = (id) => deleteItem('documents', id);

export const saveSetting = (key, value) => saveItem('settings', { key, value });
export const getSetting = async (key) => {
  const result = await getItem('settings', key);
  return result?.value;
};

// Sync status
export const isOnline = () => navigator.onLine;

// Queue for offline actions (to sync when back online)
const SYNC_QUEUE_KEY = 'mathsnip_sync_queue';

export const addToSyncQueue = (action) => {
  const queue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
  queue.push({ ...action, timestamp: Date.now() });
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
};

export const getSyncQueue = () => {
  return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
};

export const clearSyncQueue = () => {
  localStorage.setItem(SYNC_QUEUE_KEY, '[]');
};

// Export all data for backup
export const exportAllData = async () => {
  const snips = await getSnips();
  const notes = await getNotes();
  const documents = await getDocuments();

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: { snips, notes, documents }
  };
};

// Import data from backup
export const importAllData = async (backup) => {
  if (backup.data.snips) {
    for (const snip of backup.data.snips) {
      await saveSnip(snip);
    }
  }
  if (backup.data.notes) {
    for (const note of backup.data.notes) {
      await saveNote(note);
    }
  }
  if (backup.data.documents) {
    for (const doc of backup.data.documents) {
      await saveDocument(doc);
    }
  }
};

// Get storage usage
export const getStorageUsage = async () => {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage,
      quota: estimate.quota,
      percentUsed: ((estimate.usage / estimate.quota) * 100).toFixed(2)
    };
  }
  return null;
};