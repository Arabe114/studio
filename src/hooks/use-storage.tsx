"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { setStorageMode as setGlobalStorageMode, storageMode as globalStorageMode } from '@/lib/storage';

type StorageMode = 'firebase' | 'local';

interface StorageContextType {
  storageMode: StorageMode;
  setStorageMode: (mode: StorageMode) => void;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export function StorageProvider({ children }: { children: ReactNode }) {
  const [storageMode, setStorageModeState] = useState<StorageMode>(globalStorageMode);

  useEffect(() => {
    const savedMode = localStorage.getItem('storageMode') as StorageMode | null;
    if (savedMode) {
      setStorageModeState(savedMode);
      setGlobalStorageMode(savedMode);
    }
  }, []);

  const setStorageMode = (mode: StorageMode) => {
    localStorage.setItem('storageMode', mode);
    setGlobalStorageMode(mode);
    setStorageModeState(mode);
     // Little hack to force re-render on components using the context
    window.location.reload();
  };

  const value = {
    storageMode,
    setStorageMode,
  };

  return (
    <StorageContext.Provider value={value}>
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage() {
  const context = useContext(StorageContext);
  if (context === undefined) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
}
