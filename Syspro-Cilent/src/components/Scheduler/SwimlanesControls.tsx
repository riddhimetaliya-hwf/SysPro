
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LayoutGrid } from 'lucide-react';

export type SwimlaneGroup = 'none' | 'machine' | 'priority' | 'status';

interface SwimlanesControlsProps {
  currentGrouping: SwimlaneGroup;
  onGroupingChange: (grouping: SwimlaneGroup) => void;
}

export const SwimlanesControls = ({ currentGrouping, onGroupingChange }: SwimlanesControlsProps) => {
  return (
    <div className="flex items-center gap-2 p-2 bg-card border rounded-lg">
      <LayoutGrid size={16} className="text-muted-foreground" />
      <span className="text-sm font-medium">Group by:</span>
      
      <Select value={currentGrouping} onValueChange={(value: SwimlaneGroup) => onGroupingChange(value)}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          <SelectItem value="machine">Machine</SelectItem>
          <SelectItem value="priority">Priority</SelectItem>
          <SelectItem value="status">Status</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
