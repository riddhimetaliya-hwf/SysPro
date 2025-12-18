
import React, { useState } from 'react';
import { Header } from '@/components/Layout/Header';
import { AppSidebar } from '@/components/Layout/AppSidebar';
import { AISuggestions } from '@/components/Performance/AISuggestions';
import { ConflictAlertsPanel } from '@/components/Performance/ConflictAlertsPanel';
import { ScenarioPlanning } from '@/components/Performance/ScenarioPlanning';
import { OptimizationEngine } from '@/components/Performance/OptimizationEngine';
import { IntegrationHub } from '@/components/Performance/IntegrationHub';
import { DependencyManager } from '@/components/Performance/DependencyManager';
import { ERPIntegration } from '@/components/Performance/ERPIntegration';
import { RuleBuilder } from '@/components/Performance/RuleBuilder';
import { UnifiedDashboard } from '@/components/Performance/UnifiedDashboard';
import { PerformanceLicenseIndicator } from '@/components/Performance/PerformanceLicenseIndicator';
import { generateMockJobs, mockMachines } from '@/data/mockData';
import { SidebarProvider, SidebarInset } from '@/components/UI/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { Badge } from '@/components/UI/badge';
import { Brain, Zap, AlertTriangle, TrendingUp, Settings, Database, Crown } from 'lucide-react';
import { BreadcrumbNav } from '@/components/Navigation/BreadcrumbNav';
import { GlobalSearch } from '@/components/Navigation/GlobalSearch';
import { KeyboardShortcuts } from '@/components/Navigation/KeyboardShortcuts';
import { toast } from 'sonner';

const Performance = () => {
  const [jobs] = useState(generateMockJobs(30));
  
  const handleJobUpdate = (updatedJob: any) => {
    // Handle job updates
    console.log('Job updated:', updatedJob);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <SidebarInset className="flex flex-col">
          {/* Enhanced Header */}
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Performance Dashboard
                  <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800">
                    <Crown className="w-3 h-3 mr-1" />
                    LICENSED EDITION
                  </Badge>
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <GlobalSearch />
                <KeyboardShortcuts />
              </div>
            </div>
          </div>

          <BreadcrumbNav />
          
          {/* Main Performance Dashboard */}
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="overview" className="h-full flex flex-col">
              <div className="border-b px-6">
                <TabsList className="grid w-full max-w-2xl grid-cols-6">
                  <TabsTrigger value="overview" className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="insights" className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    AI Insights
                  </TabsTrigger>
                  <TabsTrigger value="alerts" className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Alerts
                  </TabsTrigger>
                  <TabsTrigger value="scenarios" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Scenarios
                  </TabsTrigger>
                  <TabsTrigger value="optimization" className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Optimization
                  </TabsTrigger>
                  <TabsTrigger value="integrations" className="flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Integrations
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-auto">
                {/* Overview Tab */}
                <TabsContent value="overview" className="h-full p-6">
                  <div className="grid grid-cols-12 gap-6 h-full">
                    {/* Main Dashboard */}
                    <div className="col-span-8">
                      <Card className="h-full">
                        <CardHeader>
                          <CardTitle>Unified Performance Dashboard</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[calc(100%-80px)]">
                          <UnifiedDashboard jobs={jobs} machines={mockMachines} />
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Side Metrics */}
                    <div className="col-span-4 space-y-6">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Quick Metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">94%</div>
                              <div className="text-xs text-muted-foreground">Efficiency</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">12</div>
                              <div className="text-xs text-muted-foreground">Active Jobs</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-600">3</div>
                              <div className="text-xs text-muted-foreground">Conflicts</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">8</div>
                              <div className="text-xs text-muted-foreground">Suggestions</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <DependencyManager jobs={jobs} onJobUpdate={handleJobUpdate} />
                    </div>
                  </div>
                </TabsContent>

                {/* AI Insights Tab */}
                <TabsContent value="insights" className="h-full p-6">
                  <div className="grid grid-cols-2 gap-6 h-full">
                    <div className="space-y-6">
                      <AISuggestions jobs={jobs} machines={mockMachines} />
                    </div>
                    <div className="space-y-6">
                      <RuleBuilder />
                    </div>
                  </div>
                </TabsContent>

                {/* Alerts Tab */}
                <TabsContent value="alerts" className="h-full p-6">
                  <div className="max-w-4xl mx-auto">
            <ConflictAlertsPanel 
              jobs={jobs} 
              machines={mockMachines}
              onResolveConflict={() => {}}
            />
                  </div>
                </TabsContent>

                {/* Scenarios Tab */}
                <TabsContent value="scenarios" className="h-full p-6">
                  <div className="grid grid-cols-2 gap-6 h-full">
                    <ScenarioPlanning jobs={jobs} machines={mockMachines} />
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Scenario History</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {['Peak Season Simulation', 'Machine Breakdown Scenario', 'Rush Order Impact'].map((scenario, idx) => (
                            <div key={idx} className="p-3 border rounded-lg">
                              <div className="font-medium text-sm">{scenario}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Run {idx + 1} hour{idx > 0 ? 's' : ''} ago
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Optimization Tab */}
                <TabsContent value="optimization" className="h-full p-6">
                  <OptimizationEngine
                    jobs={jobs}
                    machines={mockMachines}
                    onJobsOptimized={(optimizedJobs) => {
                      // Here you would update the jobs state in a real implementation
                      console.log('Optimized jobs:', optimizedJobs);
                    }}
                  />
                </TabsContent>

                {/* Integrations Tab */}
                <TabsContent value="integrations" className="h-full p-6">
                  <div className="grid grid-cols-2 gap-6 h-full">
                    <IntegrationHub />
                    <ERPIntegration 
                      jobs={jobs} 
                      onJobUpdate={(job) => {
                        toast.success(`Job ${job.name} updated successfully`);
                      }}
                    />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </SidebarInset>
        
        {/* Performance License Indicator */}
        <PerformanceLicenseIndicator />
      </div>
    </SidebarProvider>
  );
};

export default Performance;
