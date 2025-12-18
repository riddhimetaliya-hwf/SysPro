import React from 'react';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/UI/button';

interface DataLoaderProps {
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
  children: React.ReactNode;
}

export const DataLoader: React.FC<DataLoaderProps> = ({
  isLoading,
  error,
  onRetry,
  children
}) => {
  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-6 gradient-surface">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Loading Schedule</h3>
          <p className="text-sm text-muted-foreground">Fetching data from API...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-6 gradient-surface">
        <div className="relative">
          <AlertCircle className="w-16 h-16 text-destructive" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Failed to Load Data</h3>
          <p className="text-sm text-muted-foreground max-w-md">{error}</p>
          {onRetry && (
            <Button 
              onClick={onRetry} 
              variant="outline" 
              className="mt-4"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}; 