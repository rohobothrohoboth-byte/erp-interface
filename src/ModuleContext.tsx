import React, { createContext, useContext, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

type ModuleContextType = {
  activeModule: string;
  setActiveModule: (module: string) => void;
};

const ModuleContext = createContext<ModuleContextType>({
  activeModule: 'Core',
  setActiveModule: () => {},
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const ModuleProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Get initial module from localStorage or default to 'Core'
  const [activeModule, setActiveModule] = useState(() => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      return localStorage.getItem('activeModule') || 'Core';
    }
    return 'Core';
  });

  // Persist to localStorage whenever activeModule changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeModule', activeModule);
    }
  }, [activeModule]);

  return (
    <QueryClientProvider client={queryClient}>
      <ModuleContext.Provider value={{ activeModule, setActiveModule }}>
        {children}
      </ModuleContext.Provider>
    </QueryClientProvider>
  );
};

export const useModule = () => useContext(ModuleContext);