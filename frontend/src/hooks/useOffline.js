import { useState, useEffect, useCallback } from 'react';
import * as storage from '../utils/offlineStorage';

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncQueue, setSyncQueue] = useState([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync when back online
      processSyncQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initialize DB on mount
    storage.initDB();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const processSyncQueue = useCallback(async () => {
    const queue = storage.getSyncQueue();
    if (queue.length === 0) return;

    // Process each queued action
    for (const action of queue) {
      try {
        // In a real app, this would sync with the backend
        console.log('Syncing action:', action);
      } catch (error) {
        console.error('Sync failed:', error);
      }
    }

    storage.clearSyncQueue();
    setSyncQueue([]);
  }, []);

  const addToQueue = useCallback((action) => {
    storage.addToSyncQueue(action);
    setSyncQueue(storage.getSyncQueue());
  }, []);

  return {
    isOnline,
    syncQueue,
    addToQueue,
    processSyncQueue
  };
};

export const useSnips = (initialSnips = []) => {
  const [snips, setSnips] = useState(initialSnips);
  const [isLoading, setIsLoading] = useState(true);
  const { isOnline, addToQueue } = useOffline();

  useEffect(() => {
    loadSnips();
  }, []);

  const loadSnips = async () => {
    try {
      setIsLoading(true);
      const savedSnips = await storage.getSnips();
      if (savedSnips.length > 0) {
        setSnips(savedSnips.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } else {
        // Initialize with default snips if empty
        setSnips(initialSnips);
        for (const snip of initialSnips) {
          await storage.saveSnip(snip);
        }
      }
    } catch (error) {
      console.error('Failed to load snips:', error);
      setSnips(initialSnips);
    } finally {
      setIsLoading(false);
    }
  };

  const addSnip = async (snip) => {
    const newSnip = { ...snip, id: snip.id || Date.now().toString() };
    setSnips(prev => [newSnip, ...prev]);
    await storage.saveSnip(newSnip);
    
    if (!isOnline) {
      addToQueue({ type: 'ADD_SNIP', data: newSnip });
    }
    
    return newSnip;
  };

  const removeSnip = async (id) => {
    setSnips(prev => prev.filter(s => s.id !== id));
    await storage.deleteSnip(id);
    
    if (!isOnline) {
      addToQueue({ type: 'DELETE_SNIP', data: { id } });
    }
  };

  const updateSnip = async (id, updates) => {
    const updatedSnips = snips.map(s => 
      s.id === id ? { ...s, ...updates } : s
    );
    setSnips(updatedSnips);
    
    const updatedSnip = updatedSnips.find(s => s.id === id);
    if (updatedSnip) {
      await storage.saveSnip(updatedSnip);
    }
  };

  return {
    snips,
    isLoading,
    addSnip,
    removeSnip,
    updateSnip,
    refreshSnips: loadSnips
  };
};

export const useNotes = (initialNotes = []) => {
  const [notes, setNotes] = useState(initialNotes);
  const [isLoading, setIsLoading] = useState(true);
  const { isOnline, addToQueue } = useOffline();

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const savedNotes = await storage.getNotes();
      if (savedNotes.length > 0) {
        setNotes(savedNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
      } else {
        setNotes(initialNotes);
        for (const note of initialNotes) {
          await storage.saveNote(note);
        }
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
      setNotes(initialNotes);
    } finally {
      setIsLoading(false);
    }
  };

  const addNote = async (note) => {
    const newNote = { 
      ...note, 
      id: note.id || Date.now().toString(),
      createdAt: note.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setNotes(prev => [newNote, ...prev]);
    await storage.saveNote(newNote);
    return newNote;
  };

  const removeNote = async (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    await storage.deleteNote(id);
  };

  const updateNote = async (id, updates) => {
    const updatedNotes = notes.map(n => 
      n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
    );
    setNotes(updatedNotes);
    
    const updatedNote = updatedNotes.find(n => n.id === id);
    if (updatedNote) {
      await storage.saveNote(updatedNote);
    }
    return updatedNote;
  };

  return {
    notes,
    isLoading,
    addNote,
    removeNote,
    updateNote,
    refreshNotes: loadNotes
  };
};

export const useDocuments = (initialDocs = []) => {
  const [documents, setDocuments] = useState(initialDocs);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const savedDocs = await storage.getDocuments();
      if (savedDocs.length > 0) {
        setDocuments(savedDocs.sort((a, b) => new Date(b.convertedAt) - new Date(a.convertedAt)));
      } else {
        setDocuments(initialDocs);
        for (const doc of initialDocs) {
          await storage.saveDocument(doc);
        }
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
      setDocuments(initialDocs);
    } finally {
      setIsLoading(false);
    }
  };

  const addDocument = async (doc) => {
    const newDoc = { 
      ...doc, 
      id: doc.id || Date.now().toString(),
      convertedAt: doc.convertedAt || new Date().toISOString()
    };
    setDocuments(prev => [newDoc, ...prev]);
    await storage.saveDocument(newDoc);
    return newDoc;
  };

  const removeDocument = async (id) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    await storage.deleteDocument(id);
  };

  const updateDocument = async (id, updates) => {
    const updatedDocs = documents.map(d => 
      d.id === id ? { ...d, ...updates } : d
    );
    setDocuments(updatedDocs);
    
    const updatedDoc = updatedDocs.find(d => d.id === id);
    if (updatedDoc) {
      await storage.saveDocument(updatedDoc);
    }
  };

  return {
    documents,
    isLoading,
    addDocument,
    removeDocument,
    updateDocument,
    refreshDocuments: loadDocuments
  };
};