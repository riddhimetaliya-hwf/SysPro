
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { usePerformance } from '@/contexts/PerformanceContext';
import { Zap, Crown, CheckCircle } from 'lucide-react';

export const PerformanceLicenseIndicator = () => {
  const { isPerformanceMode, hasPerformanceLicense } = usePerformance();

  if (!hasPerformanceLicense) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <Badge 
        variant="secondary" 
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 shadow-lg border-0"
      >
        <Crown className="w-4 h-4 mr-2 text-yellow-300" />
        Performance Mode Active
        <CheckCircle className="w-4 h-4 ml-2 text-green-300" />
      </Badge>
    </div>
  );
};
