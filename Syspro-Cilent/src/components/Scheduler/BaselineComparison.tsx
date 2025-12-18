
import React from 'react';
import { Job } from '@/types/jobs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface BaselineComparisonProps {
  jobs: Job[];
}

export const BaselineComparison = ({ jobs }: BaselineComparisonProps) => {
  // Mock baseline comparison data
  const metrics = {
    scheduleEfficiency: { current: 87, baseline: 82, trend: 'up' as const },
    resourceUtilization: { current: 73, baseline: 78, trend: 'down' as const },
    deliveryOnTime: { current: 94, baseline: 91, trend: 'up' as const }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'same') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader className="p-3">
        <CardTitle className="text-sm">Baseline Comparison</CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        {Object.entries(metrics).map(([key, metric]) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getTrendIcon(metric.trend)}
              <span className="text-xs capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </div>
            <div className="text-xs font-mono">
              <span className="font-semibold">{metric.current}%</span>
              <span className="text-muted-foreground ml-1">
                (was {metric.baseline}%)
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
