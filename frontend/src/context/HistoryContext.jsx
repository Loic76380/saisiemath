import React, { createContext, useContext, useState, useEffect } from 'react';

const HistoryContext = createContext();

const DB_NAME = 'formulapad';
const STORE_NAME = 'history';
const MAX_ITEMS = 30;

// IndexedDB helpers
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

const getAllFromDB = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const items = request.result.sort((a, b) => b.timestamp - a.timestamp);
      resolve(items.slice(0, MAX_ITEMS));
    };
  });
};

const addToDB = async (item) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // Add new item
    const request = store.add(item);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      // Cleanup old items
      const countRequest = store.count();
      countRequest.onsuccess = () => {
        if (countRequest.result > MAX_ITEMS) {
          const cursorRequest = store.openCursor();
          let deleteCount = countRequest.result - MAX_ITEMS;
          
          cursorRequest.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor && deleteCount > 0) {
              cursor.delete();
              deleteCount--;
              cursor.continue();
            }
          };
        }
      };
      resolve(request.result);
    };
  });
};

const deleteFromDB = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

export const HistoryProvider = ({ children }) => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const items = await getAllFromDB();
        setHistory(items);
      } catch (error) {
        console.error('Erreur chargement historique:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadHistory();
  }, []);

  const addToHistory = async (item) => {
    // Avoid duplicates (same latex within 1 minute)
    const isDuplicate = history.some(
      h => h.latex === item.latex && Date.now() - h.timestamp < 60000
    );
    if (isDuplicate) return;

    try {
      const id = await addToDB(item);
      setHistory(prev => [{ ...item, id }, ...prev].slice(0, MAX_ITEMS));
    } catch (error) {
      console.error('Erreur ajout historique:', error);
    }
  };

  const removeFromHistory = async (id) => {
    try {
      await deleteFromDB(id);
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  return (
    <HistoryContext.Provider value={{ history, addToHistory, removeFromHistory, isLoading }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within HistoryProvider');
  }
  return context;
};
