import React, { useState } from 'react';
import { Header } from '@/components/Layout/Header';
import { AppSidebar } from '@/components/Layout/AppSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectSettings } from '@/components/Configuration/ProjectSettings';
import { UserRoles } from '@/components/Configuration/UserRoles';
import { WorkflowTemplates } from '@/components/Configuration/WorkflowTemplates';
import { ColorLabelConfig } from '@/components/Configuration/ColorLabelConfig';
import { SyncSettings } from '@/components/Configuration/SyncSettings';

const Configuration = () => {
  const [activeTab, setActiveTab] = useState('project-settings');
  
  return (
    <div className="min-h-screen flex">
      <AppSidebar />
      
      <div className="flex-1 flex flex-col w-full">
        <Header />
        
        <div className="flex-1 p-0 overflow-auto">
          <div className="max-w-full px-[28.5rem] pt-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Configuration</h1>
              <p className="text-muted-foreground">Manage project settings, users, workflows, and more</p>
            </div>
            
            <Tabs 
              defaultValue="project-settings" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full space-y-4"
            >
              <TabsList className="w-full grid grid-cols-2 md:grid-cols-5 gap-2">
                <TabsTrigger value="project-settings">Project Settings</TabsTrigger>
                <TabsTrigger value="user-roles">User & Roles</TabsTrigger>
                <TabsTrigger value="workflow-templates">Workflow Templates</TabsTrigger>
                <TabsTrigger value="color-label">Color & Label</TabsTrigger>
                <TabsTrigger value="sync-settings">Sync Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="project-settings" className="m-0 border-0 p-0">
                <ProjectSettings />
              </TabsContent>
              
              <TabsContent value="user-roles" className="m-0 border-0 p-0">
                <UserRoles />
              </TabsContent>
              
              <TabsContent value="workflow-templates" className="m-0 border-0 p-0">
                <WorkflowTemplates />
              </TabsContent>
              
              <TabsContent value="color-label" className="m-0 border-0 p-0">
                <ColorLabelConfig />
              </TabsContent>
              
              <TabsContent value="sync-settings" className="m-0 border-0 p-0">
                <SyncSettings />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuration;
