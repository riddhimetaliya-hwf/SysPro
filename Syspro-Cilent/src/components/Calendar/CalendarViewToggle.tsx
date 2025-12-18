import React from 'react';
import { Button } from '@/components/UI/button';
import { Calendar, CalendarDays, CalendarRange } from 'lucide-react';

interface CalendarViewToggleProps {
  currentView: 'daily' | 'weekly' | 'monthly';
  onViewChange: (view: 'daily' | 'weekly' | 'monthly') => void;
}

export const CalendarViewToggle = ({ currentView, onViewChange }: CalendarViewToggleProps) => {
  const views = [
    { id: 'daily' as const, label: 'Daily', icon: Calendar },
    { id: 'weekly' as const, label: 'Weekly', icon: CalendarDays },
    { id: 'monthly' as const, label: 'Monthly', icon: CalendarRange }
  ];

  return (
    <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
      {views.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          variant={currentView === id ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange(id)}
          className="h-8 px-3"
        >
          <Icon className="w-4 h-4 mr-1" />
          {label}
        </Button>
      ))}
    </div>
  );
};