
import React from 'react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/UI/tabs';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabViewProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const TabView = ({ 
  tabs, 
  activeTab, 
  onTabChange, 
  children,
  className 
}: TabViewProps) => {
  // Split children into an array if it's a single element
  const childrenArray = React.Children.toArray(children);
  
  return (
    <Tabs 
      value={activeTab} 
      onValueChange={onTabChange} 
      className={cn("w-full h-full flex flex-col", className)}
    >
      <div className="border-b flex-shrink-0">
        <TabsList className="h-10 bg-transparent w-full flex justify-start rounded-none p-0">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                "h-10 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none data-[state=active]:bg-transparent",
                "transition-all duration-200 font-medium"
              )}
            >
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      
      {tabs.map((tab, index) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-0 flex-1 min-h-0">
          <div className="h-full">
            {childrenArray[index] || null}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};
