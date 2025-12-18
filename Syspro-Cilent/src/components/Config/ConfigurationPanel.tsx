
import React from 'react';
import { Switch } from '@/components/UI/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/UI/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/UI/select';
import { GanttConfig } from '@/types/jobs';

interface ConfigurationPanelProps {
  config: GanttConfig;
  onConfigChange: (config: GanttConfig) => void;
  onApply: () => void;
  onReset: () => void;
}

export const ConfigurationPanel = ({
  config,
  onConfigChange,
  onApply,
  onReset
}: ConfigurationPanelProps) => {
  
  const handleTimeHorizonChange = (values: number[]) => {
    onConfigChange({ ...config, timeHorizon: values[0] });
  };
  
  const toggleSetting = (setting: keyof GanttConfig) => {
    onConfigChange({ 
      ...config, 
      [setting]: !config[setting as keyof GanttConfig] 
    });
  };
  
  const handleHourChange = (type: 'dayStartHour' | 'dayEndHour', value: string) => {
    onConfigChange({ 
      ...config, 
      [type]: parseInt(value) 
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Time Horizon Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label htmlFor="timeHorizon" className="text-sm font-semibold text-foreground">
            Time Horizon: {config.timeHorizon} days
          </Label>
        </div>
        <Slider
          id="timeHorizon"
          min={7}
          max={90}
          step={7}
          value={[config.timeHorizon]}
          onValueChange={handleTimeHorizonChange}
          className="w-full"
        />
      </div>
      
      {/* Conflict Detection Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gradient">Conflict Detection</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
            <Label htmlFor="detectCapacityConflicts" className="text-sm text-foreground">
              Detect Capacity Conflicts
            </Label>
            <Switch
              id="detectCapacityConflicts"
              checked={config.detectCapacityConflicts}
              onCheckedChange={() => toggleSetting('detectCapacityConflicts')}
            />
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
            <Label htmlFor="detectMaterialConflicts" className="text-sm text-foreground">
              Detect Material Conflicts
            </Label>
            <Switch
              id="detectMaterialConflicts"
              checked={config.detectMaterialConflicts}
              onCheckedChange={() => toggleSetting('detectMaterialConflicts')}
            />
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
            <Label htmlFor="enforceDependencies" className="text-sm text-foreground">
              Enforce Dependencies
            </Label>
            <Switch
              id="enforceDependencies"
              checked={config.enforceDependencies}
              onCheckedChange={() => toggleSetting('enforceDependencies')}
            />
          </div>
        </div>
      </div>
      
      {/* Working Hours Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gradient">Working Hours</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dayStartHour" className="text-sm text-foreground">Day Start</Label>
            <Select
              value={config.dayStartHour.toString()}
              onValueChange={(value) => handleHourChange('dayStartHour', value)}
            >
              <SelectTrigger className="glass-panel bg-muted/20 border-white/10">
                <SelectValue placeholder="Start Hour" />
              </SelectTrigger>
              <SelectContent className="glass-panel bg-background/95 backdrop-blur-md border-white/10">
                {Array.from({length: 12}, (_, i) => i + 6).map(hour => (
                  <SelectItem key={hour} value={hour.toString()}>
                    {hour}:00
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dayEndHour" className="text-sm text-foreground">Day End</Label>
            <Select
              value={config.dayEndHour.toString()}
              onValueChange={(value) => handleHourChange('dayEndHour', value)}
            >
              <SelectTrigger className="glass-panel bg-muted/20 border-white/10">
                <SelectValue placeholder="End Hour" />
              </SelectTrigger>
              <SelectContent className="glass-panel bg-background/95 backdrop-blur-md border-white/10">
                {Array.from({length: 12}, (_, i) => i + 12).map(hour => (
                  <SelectItem key={hour} value={hour.toString()}>
                    {hour}:00
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
        <Button 
          variant="outline" 
          onClick={onReset}
          className="glass-panel hover:bg-muted/30"
        >
          Reset
        </Button>
        <Button 
          onClick={onApply}
          className="gradient-brand text-white hover:shadow-medium"
        >
          Apply Configuration
        </Button>
      </div>
    </div>
  );
};
