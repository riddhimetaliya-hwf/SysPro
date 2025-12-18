
import React, { useState } from 'react';
import { Button } from '@/components/UI/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/UI/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { toast } from 'sonner';
import { Bell, Check, Mail, Save, RefreshCw } from 'lucide-react';

export const SyncSettings = () => {
  const [autoSync, setAutoSync] = useState(true);
  const [syncFrequency, setSyncFrequency] = useState('60');
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyApp, setNotifyApp] = useState(true);
  
  const handleSaveSettings = () => {
    toast.success('Sync settings updated successfully');
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Sync Settings</h2>
        <p className="text-muted-foreground">Configure data synchronization preferences</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw size={18} />
            Automatic Synchronization
          </CardTitle>
          <CardDescription>Configure how often data should be synchronized</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-sync">Enable Auto-sync</Label>
              <p className="text-sm text-muted-foreground">
                Automatically sync data at regular intervals
              </p>
            </div>
            <Switch
              id="auto-sync"
              checked={autoSync}
              onCheckedChange={setAutoSync}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sync-frequency">Sync Frequency</Label>
            <Select 
              value={syncFrequency} 
              onValueChange={setSyncFrequency}
              disabled={!autoSync}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">Every 15 minutes</SelectItem>
                <SelectItem value="30">Every 30 minutes</SelectItem>
                <SelectItem value="60">Every hour</SelectItem>
                <SelectItem value="120">Every 2 hours</SelectItem>
                <SelectItem value="360">Every 6 hours</SelectItem>
                <SelectItem value="720">Every 12 hours</SelectItem>
                <SelectItem value="1440">Daily</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-3">Last Sync Status</h3>
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-flex h-2 w-2 rounded-full bg-green-500"></span>
              <span>Last successful sync: 10 minutes ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell size={18} />
            Notification Preferences
          </CardTitle>
          <CardDescription>Configure sync-related notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notify" className="flex items-center gap-2">
                <Mail size={16} />
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive email alerts for sync failures
              </p>
            </div>
            <Switch
              id="email-notify"
              checked={notifyEmail}
              onCheckedChange={setNotifyEmail}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="app-notify" className="flex items-center gap-2">
                <Bell size={16} />
                In-App Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Show notifications within the application
              </p>
            </div>
            <Switch
              id="app-notify"
              checked={notifyApp}
              onCheckedChange={setNotifyApp}
            />
          </div>
          
          <div className="bg-muted/30 p-3 rounded-md text-sm text-muted-foreground mt-2">
            <p>Notifications are only sent when sync encounters errors or significant delays.</p>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => {
          setAutoSync(true);
          setSyncFrequency('60');
          setNotifyEmail(true);
          setNotifyApp(true);
          toast.info('Settings reset to defaults');
        }}>
          Reset to Defaults
        </Button>
        <Button onClick={handleSaveSettings}>
          <Save size={16} className="mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};
