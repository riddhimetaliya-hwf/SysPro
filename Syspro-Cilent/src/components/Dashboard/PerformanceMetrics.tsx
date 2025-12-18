
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Progress } from '@/components/UI/progress';
import { TrendingUp, TrendingDown, Clock, CheckCircle } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  icon: React.ReactNode;
}

const MetricCard = ({ title, value, unit, trend, trendValue, icon }: MetricCardProps) => {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-500';
    if (trend === 'down') return 'text-red-500';
    return 'text-muted-foreground';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3" />;
    return null;
  };

  return (
    <Card className="hover:shadow-medium transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm text-muted-foreground">{title}</span>
          </div>
          <div className={`flex items-center gap-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-xs font-medium">{trendValue}%</span>
          </div>
        </div>
        <div className="mt-2">
          <span className="text-2xl font-bold">{value}</span>
          <span className="text-sm text-muted-foreground ml-1">{unit}</span>
        </div>
        <Progress value={Math.min(value, 100)} className="mt-2 h-1" />
      </CardContent>
    </Card>
  );
};

export const PerformanceMetrics = () => {
  const metrics = [
    {
      title: 'Schedule Efficiency',
      value: 87,
      unit: '%',
      trend: 'up' as const,
      trendValue: 5.2,
      icon: <CheckCircle className="w-4 h-4 text-green-500" />
    },
    {
      title: 'On-time Delivery',
      value: 94,
      unit: '%',
      trend: 'up' as const,
      trendValue: 2.1,
      icon: <Clock className="w-4 h-4 text-blue-500" />
    },
    {
      title: 'Resource Utilization',
      value: 73,
      unit: '%',
      trend: 'down' as const,
      trendValue: -1.8,
      icon: <TrendingUp className="w-4 h-4 text-orange-500" />
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Performance Overview</h3>
      <div className="grid gap-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>
    </div>
  );
};
