
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/UI/button';
import { Badge } from '@/components/UI/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/UI/progress';
import { Database, Settings, Check, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface Integration {
  id: string;
  name: string;
  provider: string;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSync: Date;
  dataHealth: number;
  enabled: boolean;
}

export const IntegrationHub = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'sap',
      name: 'SAP ERP',
      provider: 'SAP',
      status: 'connected',
      lastSync: new Date(Date.now() - 300000), // 5 minutes ago
      dataHealth: 98,
      enabled: true
    },
    {
      id: 'oracle',
      name: 'Oracle Manufacturing',
      provider: 'Oracle',
      status: 'disconnected',
      lastSync: new Date(Date.now() - 86400000), // 1 day ago
      dataHealth: 0,
      enabled: false
    },
    {
      id: 'mes',
      name: 'Manufacturing Execution System',
      provider: 'Wonderware',
      status: 'syncing',
      lastSync: new Date(Date.now() - 60000), // 1 minute ago
      dataHealth: 85,
      enabled: true
    }
  ]);

  const toggleIntegration = (id: string) => {
    setIntegrations(prev => prev.map(integration => {
      if (integration.id === id) {
        const newEnabled = !integration.enabled;
        const newStatus = newEnabled ? 'connected' : 'disconnected';
        
        toast.success(`${integration.name} ${newEnabled ? 'enabled' : 'disabled'}`);
        
        return {
          ...integration,
          enabled: newEnabled,
          status: newStatus,
          lastSync: newEnabled ? new Date() : integration.lastSync
        };
      }
      return integration;
    }));
  };

  const syncIntegration = (id: string) => {
    setIntegrations(prev => prev.map(integration => {
      if (integration.id === id) {
        toast.success(`Starting sync with ${integration.name}...`);
        return { ...integration, status: 'syncing' as const };
      }
      return integration;
    }));

    // Simulate sync process
    setTimeout(() => {
      setIntegrations(prev => prev.map(integration => {
        if (integration.id === id) {
          return {
            ...integration,
            status: 'connected' as const,
            lastSync: new Date(),
            dataHealth: Math.round(90 + Math.random() * 10)
          };
        }
        return integration;
      }));
      toast.success('Sync completed successfully');
    }, 3000);
  };

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return <Check size={14} className="text-green-500" />;
      case 'disconnected': return <AlertTriangle size={14} className="text-gray-500" />;
      case 'error': return <AlertTriangle size={14} className="text-red-500" />;
      case 'syncing': return <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
    }
  };

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'disconnected': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'syncing': return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Database size={16} />
          Integration Hub
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {integrations.map(integration => (
          <div key={integration.id} className="p-3 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(integration.status)}
                <div>
                  <div className="font-medium text-sm">{integration.name}</div>
                  <div className="text-xs text-muted-foreground">{integration.provider}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(integration.status)}>
                  {integration.status.toUpperCase()}
                </Badge>
                <Switch
                  checked={integration.enabled}
                  onCheckedChange={() => toggleIntegration(integration.id)}
                  disabled={integration.status === 'syncing'}
                />
              </div>
            </div>

            {integration.enabled && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Data Health</span>
                    <span>{integration.dataHealth}%</span>
                  </div>
                  <Progress value={integration.dataHealth} className="h-1" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Last sync: {integration.lastSync.toLocaleTimeString()}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => syncIntegration(integration.id)}
                      disabled={integration.status === 'syncing'}
                      size="sm"
                      variant="outline"
                    >
                      {integration.status === 'syncing' ? 'Syncing...' : 'Sync Now'}
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Settings size={14} />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
