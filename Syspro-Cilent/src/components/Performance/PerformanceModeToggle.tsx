
import React from 'react';
import { Badge } from '@/components/UI/badge';
import { usePerformance } from '@/contexts/PerformanceContext';
import { Zap, Info, Crown, CheckCircle } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/UI/tooltip';

export const PerformanceModeToggle = () => {
  const { isPerformanceMode, hasPerformanceLicense } = usePerformance();

  return (
    <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
      <div className="flex items-center gap-2">
        <Zap className={`w-5 h-5 ${isPerformanceMode ? 'text-primary' : 'text-muted-foreground'}`} />
        <span className="font-medium text-sm">Performance Edition</span>
        {isPerformanceMode ? (
          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
            <Crown className="w-3 h-3 mr-1" />
            LICENSED
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs">
            NOT LICENSED
          </Badge>
        )}
      </div>
      
      <div className="flex items-center gap-2 ml-auto">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <div className="space-y-2">
                <p className="font-medium">Performance Edition Features:</p>
                <ul className="text-xs space-y-1">
                  <li>• Smart conflict detection & alerts</li>
                  <li>• Real-time drag impact analysis</li>
                  <li>• Auto-resolution suggestions</li>
                  <li>• Enhanced visual feedback</li>
                  <li>• Advanced dependency tracking</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  {isPerformanceMode ? 'Licensed and active' : 'Contact sales for licensing'}
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {isPerformanceMode && (
          <CheckCircle className="w-4 h-4 text-green-600" />
        )}
      </div>
    </div>
  );
};
