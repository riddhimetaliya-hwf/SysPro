
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { MoreHorizontal, Maximize2, Minimize2, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/UI/dropdown-menu';

interface DashboardWidgetProps {
  id: string;
  title: string;
  children: React.ReactNode;
  onRemove?: (id: string) => void;
  onExpand?: (id: string) => void;
  isExpanded?: boolean;
  className?: string;
}

export const DashboardWidget = ({ 
  id, 
  title, 
  children, 
  onRemove, 
  onExpand, 
  isExpanded = false,
  className = ''
}: DashboardWidgetProps) => {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <Card className={`transition-all duration-300 ${isExpanded ? 'col-span-2 row-span-2' : ''} ${className} card-elevated`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsMinimized(!isMinimized)}>
              {isMinimized ? <Maximize2 className="w-4 h-4 mr-2" /> : <Minimize2 className="w-4 h-4 mr-2" />}
              {isMinimized ? 'Expand' : 'Minimize'}
            </DropdownMenuItem>
            {onExpand && (
              <DropdownMenuItem onClick={() => onExpand(id)}>
                <Maximize2 className="w-4 h-4 mr-2" />
                {isExpanded ? 'Restore' : 'Maximize'}
              </DropdownMenuItem>
            )}
            {onRemove && (
              <DropdownMenuItem onClick={() => onRemove(id)} className="text-destructive">
                <X className="w-4 h-4 mr-2" />
                Remove
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      {!isMinimized && (
        <CardContent className="transition-all duration-300">
          {children}
        </CardContent>
      )}
    </Card>
  );
};
