import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FilterOptions } from '@/types/jobs';

interface UserPreferences {
  defaultView: string;
  filters: FilterOptions;
  panelLayout: {
    controlPanelCollapsed: boolean;
    aiAssistantVisible: boolean;
  };
  notifications: {
    enabled: boolean;
    priority: 'all' | 'high' | 'critical';
  };
  bulkOperations: {
    selectedJobs: number[];
    lastAction: string | null;
  };
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
  saveSession: () => void;
  loadSession: () => void;
}

const defaultPreferences: UserPreferences = {
  defaultView: 'gantt',
  filters: {
    machine: null,
    status: null,
    material: null,
    search: '',
    crewSkill: null,
    job: null,
    product: null
  },
  panelLayout: {
    controlPanelCollapsed: false,
    aiAssistantVisible: false,
  },
  notifications: {
    enabled: true,
    priority: 'high',
  },
  bulkOperations: {
    selectedJobs: [],
    lastAction: null,
  },
};

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within UserPreferencesProvider');
  }
  return context;
};

interface UserPreferencesProviderProps {
  children: ReactNode;
}

export const UserPreferencesProvider = ({ children }: UserPreferencesProviderProps) => {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

  // Load preferences from sessionStorage on mount
  useEffect(() => {
    loadSession();
  }, []);

  // Auto-save preferences when they change
  useEffect(() => {
    const timer = setTimeout(() => {
      saveSession();
    }, 1000); // Debounce saves

    return () => clearTimeout(timer);
  }, [preferences]);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({
      ...prev,
      ...updates,
      // Deep merge for nested objects
      filters: updates.filters ? { ...prev.filters, ...updates.filters } : prev.filters,
      panelLayout: updates.panelLayout ? { ...prev.panelLayout, ...updates.panelLayout } : prev.panelLayout,
      notifications: updates.notifications ? { ...prev.notifications, ...updates.notifications } : prev.notifications,
      bulkOperations: updates.bulkOperations ? { ...prev.bulkOperations, ...updates.bulkOperations } : prev.bulkOperations,
    }));
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
    sessionStorage.removeItem('userPreferences');
  };

  const saveSession = () => {
    try {
      sessionStorage.setItem('userPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save user preferences:', error);
    }
  };

  const loadSession = () => {
    try {
      const saved = sessionStorage.getItem('userPreferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        setPreferences({ ...defaultPreferences, ...parsed });
      }
    } catch (error) {
      console.warn('Failed to load user preferences:', error);
    }
  };

  const value: UserPreferencesContextType = {
    preferences,
    updatePreferences,
    resetPreferences,
    saveSession,
    loadSession,
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
};