export const config = {
  api: {
    baseUrl: import.meta.env.PROD 
      ? 'https://apps.driscollassociates.com/VisualSchedulerAPI'
      : 'https://localhost:7104',
    timeout: 30000, 
  },
  
  app: { 
    name: 'Visual Production Scheduler',
    version: '1.0.0',
    environment: import.meta.env.MODE,
  },
  
  features: {
    enableAIAssistant: true,
    enablePerformanceMode: true,
    enableConflictDetection: true,
    enableRealTimeUpdates: false, 
  },
};

export const getApiUrl = (endpoint: string = ''): string => {
  return `${config.api.baseUrl}${endpoint}`;
};

export const isDevelopment = (): boolean => {
  return import.meta.env.DEV;
};

export const isProduction = (): boolean => {
  return import.meta.env.PROD;
}; 