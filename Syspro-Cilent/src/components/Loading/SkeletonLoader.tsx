import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  variant?: 'gantt' | 'card' | 'table' | 'chart' | 'form';
  rows?: number;
  className?: string;
}

export const SkeletonLoader = ({ variant = 'card', rows = 3, className }: SkeletonLoaderProps) => {
  switch (variant) {
    case 'gantt':
      return (
        <div className={cn("space-y-4", className)}>
          {/* Header */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
          
          {/* Timeline Header */}
          <div className="flex gap-1">
            <Skeleton className="h-8 w-32" />
            {Array.from({ length: 14 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-16" />
            ))}
          </div>
          
          {/* Machine Rows */}
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex gap-1">
              <Skeleton className="h-12 w-32" />
              {Array.from({ length: 14 }).map((_, j) => (
                <div key={j} className="w-16 h-12 relative">
                  {Math.random() > 0.7 && (
                    <Skeleton className="absolute inset-1 h-10 rounded" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      );

    case 'card':
      return (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
          {Array.from({ length: rows }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );

    case 'table':
      return (
        <div className={cn("space-y-4", className)}>
          <div className="flex justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="border rounded-lg">
            {/* Table Header */}
            <div className="flex border-b p-4 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 flex-1" />
              ))}
            </div>
            {/* Table Rows */}
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="flex p-4 gap-4 border-b last:border-b-0">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton key={j} className="h-4 flex-1" />
                ))}
              </div>
            ))}
          </div>
        </div>
      );

    case 'chart':
      return (
        <div className={cn("space-y-4", className)}>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-6 w-12" />
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton 
                key={i} 
                className="w-8 rounded-t"
                style={{ height: `${Math.random() * 200 + 50}px` }}
              />
            ))}
          </div>
          <div className="flex justify-center gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      );

    case 'form':
      return (
        <div className={cn("space-y-6", className)}>
          <Skeleton className="h-8 w-48" />
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      );

    default:
      return (
        <div className={cn("space-y-4", className)}>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      );
  }
};

// Specific skeleton components for common layouts
export const GanttSkeleton = () => (
  <SkeletonLoader variant="gantt" rows={6} />
);

export const CardGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <SkeletonLoader variant="card" rows={count} />
);

export const ChartSkeleton = () => (
  <SkeletonLoader variant="chart" />
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <SkeletonLoader variant="table" rows={rows} />
);

export const FormSkeleton = ({ fields = 4 }: { fields?: number }) => (
  <SkeletonLoader variant="form" rows={fields} />
);