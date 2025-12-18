
import React from 'react';
import { Header } from '@/components/Layout/Header';
import { AppSidebar } from '@/components/Layout/AppSidebar';
import { SyncStatusView } from '@/components/SyncStatus/SyncStatusView';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

const SyncStatus = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <SidebarInset className="flex flex-col">
          <Header />
          
          <div className="p-6 h-[calc(100vh-56px)] overflow-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Sync Status</h1>
              <p className="text-muted-foreground">Monitor and manage your data synchronization</p>
            </div>
            
            <SyncStatusView />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default SyncStatus;
