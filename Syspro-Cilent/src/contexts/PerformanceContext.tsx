
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface PerformanceContextType {
  isPerformanceMode: boolean;
  hasPerformanceLicense: boolean;
  setHasPerformanceLicense: (licensed: boolean) => void;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (context === undefined) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};

interface PerformanceProviderProps {
  children: ReactNode;
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({ children }) => {
  const [hasPerformanceLicense, setHasPerformanceLicense] = useState(true); // Set to true for demo
  const [isPerformanceMode, setIsPerformanceMode] = useState(false);

  // Automatically enable performance mode when license is activated
  useEffect(() => {
    setIsPerformanceMode(hasPerformanceLicense);
  }, [hasPerformanceLicense]);

  return (
    <PerformanceContext.Provider value={{ 
      isPerformanceMode, 
      hasPerformanceLicense, 
      setHasPerformanceLicense 
    }}>
      {children}
    </PerformanceContext.Provider>
  );
};
