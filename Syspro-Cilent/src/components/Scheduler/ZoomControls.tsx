
import React from 'react';
import { Button } from '@/components/UI/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ZoomIn, ZoomOut } from 'lucide-react';

export type ZoomLevel = 'hours' | 'days' | 'weeks' | 'months';

interface ZoomControlsProps {
  currentZoom: ZoomLevel;
  onZoomChange: (zoom: ZoomLevel) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const ZoomControls = ({ currentZoom, onZoomChange, onZoomIn, onZoomOut }: ZoomControlsProps) => {
  return (
    <div className="flex items-center gap-2 p-2 bg-card border rounded-lg">
      <Button size="sm" variant="outline" onClick={onZoomOut}>
        <ZoomOut size={14} />
      </Button>
      
      <Select value={currentZoom} onValueChange={(value: ZoomLevel) => onZoomChange(value)}>
        <SelectTrigger className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="hours">Hours</SelectItem>
          <SelectItem value="days">Days</SelectItem>
          <SelectItem value="weeks">Weeks</SelectItem>
          <SelectItem value="months">Months</SelectItem>
        </SelectContent>
      </Select>
      
      <Button size="sm" variant="outline" onClick={onZoomIn}>
        <ZoomIn size={14} />
      </Button>
    </div>
  );
};
