import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the structure for page state
interface PageState {
  [pageId: string]: {
    [key: string]: any;
  };
}

interface PageStateContextType {
  getPageState: (pageId: string, key: string) => any;
  setPageState: (pageId: string, key: string, value: any) => void;
  clearPageState: (pageId: string) => void;
  clearAllPageState: () => void;
}

const PageStateContext = createContext<PageStateContextType | undefined>(undefined);

export function PageStateProvider({ children }: { children: ReactNode }) {
  const [pageState, setPageStateInternal] = useState<PageState>(() => {
    // Load from localStorage on initialization
    const saved = localStorage.getItem('ai-study-buddy-page-state');
    return saved ? JSON.parse(saved) : {};
  });

  // Save to localStorage whenever pageState changes
  useEffect(() => {
    localStorage.setItem('ai-study-buddy-page-state', JSON.stringify(pageState));
  }, [pageState]);

  const getPageState = (pageId: string, key: string) => {
    return pageState[pageId]?.[key];
  };

  const setPageState = (pageId: string, key: string, value: any) => {
    setPageStateInternal(prev => ({
      ...prev,
      [pageId]: {
        ...prev[pageId],
        [key]: value
      }
    }));
  };

  const clearPageState = (pageId: string) => {
    setPageStateInternal(prev => {
      const newState = { ...prev };
      delete newState[pageId];
      return newState;
    });
  };

  const clearAllPageState = () => {
    setPageStateInternal({});
  };

  return (
    <PageStateContext.Provider value={{
      getPageState,
      setPageState,
      clearPageState,
      clearAllPageState
    }}>
      {children}
    </PageStateContext.Provider>
  );
}

export function usePageState() {
  const context = useContext(PageStateContext);
  if (context === undefined) {
    throw new Error('usePageState must be used within a PageStateProvider');
  }
  return context;
}

// Custom hook for managing state with persistence
export function usePersistentState<T>(
  pageId: string,
  key: string,
  defaultValue: T
): [T, (value: T) => void] {
  const { getPageState, setPageState } = usePageState();
  
  const [state, setState] = useState<T>(() => {
    const saved = getPageState(pageId, key);
    return saved !== undefined ? saved : defaultValue;
  });

  const setValue = (value: T) => {
    setState(value);
    setPageState(pageId, key, value);
  };

  return [state, setValue];
}
