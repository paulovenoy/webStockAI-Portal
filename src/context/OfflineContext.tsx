import React, { createContext, useContext, useState, useEffect } from 'react';

export interface PendingAction {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  data?: any;
}

interface OfflineContextType {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  effectiveOnline: boolean;
  pendingQueue: PendingAction[];
  lastSyncedAt: string | null;
  isSyncing: boolean;
  toggleSimulatedOffline: () => void;
  enqueueOfflineAction: (type: string, description: string, data?: any) => void;
  syncWithCloud: () => Promise<void>;
  clearQueue: () => void;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

const LOCAL_STORAGE_QUEUE_KEY = '@portal-stock-ai:offline-queue';
const LOCAL_STORAGE_LAST_SYNC_KEY = '@portal-stock-ai:last-sync';

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [pendingQueue, setPendingQueue] = useState<PendingAction[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_QUEUE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => {
    return localStorage.getItem(LOCAL_STORAGE_LAST_SYNC_KEY) || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Listen to browser network changes
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save queue to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_QUEUE_KEY, JSON.stringify(pendingQueue));
    } catch (e) {
      console.error('Erro ao salvar fila offline:', e);
    }
  }, [pendingQueue]);

  const effectiveOnline = isOnline && !isSimulatedOffline;

  const toggleSimulatedOffline = () => {
    setIsSimulatedOffline(prev => !prev);
  };

  const enqueueOfflineAction = (type: string, description: string, data?: any) => {
    const newAction: PendingAction = {
      id: 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      type,
      description,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      data
    };
    setPendingQueue(prev => [newAction, ...prev]);
  };

  const syncWithCloud = async () => {
    if (pendingQueue.length === 0 && effectiveOnline) {
      return;
    }
    setIsSyncing(true);
    
    // Simulate network delay for sync
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Clear pending queue and update sync timestamp
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setPendingQueue([]);
    setLastSyncedAt(now);
    localStorage.setItem(LOCAL_STORAGE_LAST_SYNC_KEY, now);
    localStorage.removeItem(LOCAL_STORAGE_QUEUE_KEY);

    setIsSyncing(false);
  };

  const clearQueue = () => {
    setPendingQueue([]);
    localStorage.removeItem(LOCAL_STORAGE_QUEUE_KEY);
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isSimulatedOffline,
        effectiveOnline,
        pendingQueue,
        lastSyncedAt,
        isSyncing,
        toggleSimulatedOffline,
        enqueueOfflineAction,
        syncWithCloud,
        clearQueue
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOfflineSync = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOfflineSync deve ser usado dentro de um OfflineProvider');
  }
  return context;
};
