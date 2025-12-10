import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Layout/Header';
import { AppSidebar } from '@/components/Layout/AppSidebar';
import { GanttChart } from '@/components/Scheduler/GanttChart';
import { CardView } from '@/components/Scheduler/CardView';
import { TabView, TabItem } from '@/components/Layout/TabView';
import { EnhancedConflictDetection } from '@/components/Performance/EnhancedConflictDetection';
import { ConflictSummaryPanel } from '@/components/Scheduler/ConflictSummaryPanel';
import { FilterOptions, GanttConfig, Job, Machine } from '@/types/jobs';
import { toast } from 'sonner';
import { CalendarDays, LayoutGrid, Zap, Bot, RefreshCw } from 'lucide-react';
import { SidebarProvider, SidebarInset } from '@/components/UI/sidebar';
import { Button } from '@/components/UI/button';
import { TooltipProvider } from '@/components/UI/tooltip';
import { PerformanceProvider, usePerformance } from '@/contexts/PerformanceContext';
import { EnhancedGanttChart } from '@/components/Performance/EnhancedGanttChart';
import { BreadcrumbNav } from '@/components/Navigation/BreadcrumbNav';
import { FloatingActionButton } from '@/components/Navigation/FloatingActionButton';
import { KeyboardShortcuts } from '@/components/Navigation/KeyboardShortcuts';
import { OperationHistoryProvider, OperationHistoryControls, useOperationHistory } from '@/components/Operations/OperationHistory';
import { UnifiedControlPanel } from '@/components/Layout/UnifiedControlPanel';
import { ResponsiveContainer } from '@/components/Layout/ResponsiveContainer';
import { UnifiedCalendarView } from '@/components/Calendar/UnifiedCalendarView';
import { AIAssistantPanel } from '@/components/AI/AIAssistantPanel';
import { useFilters } from '@/contexts/FilterContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { stripLeadingZeros } from '@/lib/utils';

//---------FOR PRODUCTION USE THIS API BASE URL ---------//
//  const API_BASE = "https://apps.driscollassociates.com/VisualSchedulerAPI/api";

//---------FOR DEVELOPMENT USE THIS API BASE URL ---------//
const API_BASE = "https://localhost:7104/api";

const defaultConfig: GanttConfig = {
  timeHorizon: 7, 
  detectCapacityConflicts: true,
  detectMaterialConflicts: true,
  enforceDependencies: true,
  dayStartHour: 8,
  dayEndHour: 18
};

const IndexContent = () => {
  const { isPerformanceMode } = usePerformance();
  const { addOperation } = useOperationHistory();
  const { filters, setFilters } = useFilters();

  const [config, setConfig] = useState<GanttConfig>(defaultConfig);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeTab, setActiveTab] = useState('gantt');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isControlPanelCollapsed, setIsControlPanelCollapsed] = useState(true);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [ganttStartDate, setGanttStartDate] = useState<Date>(new Date());

  const tabs: TabItem[] = [
    { id: 'gantt', label: 'Gantt View', icon: <CalendarDays size={16} /> },
    { id: 'card', label: 'Card View', icon: <LayoutGrid size={16} /> },
    { id: 'calendar', label: 'Calendar View', icon: <CalendarDays size={16} /> },
    { id: 'conflicts', label: 'Conflict Detection', icon: <Zap size={16} /> }
  ];

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setIsRefreshing(true);
      const [jobsRes, machinesRes] = await Promise.all([
        fetch(`${API_BASE}/scheduling/job`),
        fetch(`${API_BASE}/jobfilter/jobs-by-machine`)
      ]);
      const jobsData = await jobsRes.json();
      const machinesData = await machinesRes.json();
      setJobs(jobsData);
      setMachines(machinesData as Machine[]);
      toast.success("Data refreshed successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load scheduling data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    await fetchData();
  };

 const handleJobUpdate = (updatedJob: Job) => {
  const oldJobs = [...jobs];
  const newJobs = jobs.map(job =>
    job.id === updatedJob.id ? updatedJob : job
  );
  setJobs(newJobs);


  addOperation({
    type: "job-update",
    description: `Updated job ${stripLeadingZeros(updatedJob.id)} position`,
    data: { oldJobs, newJobs, updatedJob },
    undoAction: () => setJobs(oldJobs),
    redoAction: () => setJobs(newJobs)
  });
};


  const handleResolveConflict = (jobId: string) => {
    const jobIdNum = parseInt(jobId);
    const oldJobs = [...jobs];
    const newJobs = jobs.map(job =>
      Number(job.id) === jobIdNum
        ? { ...job, conflictType: "none" as const, conflictDetails: undefined }
        : job
    );
    setJobs(newJobs);
    toast.success("Conflict resolved", {
      description: `Job ${jobIdNum} conflict has been resolved`
    });
    addOperation({
      type: "conflict-resolve",
      description: `Resolved conflict for job ${jobIdNum}`,
      data: { oldJobs, newJobs, jobId: jobIdNum },
      undoAction: () => setJobs(oldJobs),
      redoAction: () => setJobs(newJobs)
    });
  };

   const handleConflictResolved = (conflictId: string) => {
    toast.success('Conflict automatically resolved', {
      description: `Resolution applied for conflict: ${conflictId}`
    });
  };

  return (
    <SidebarProvider>
  <ResponsiveContainer className="min-h-screen flex w-full ">
    <AppSidebar />

    <SidebarInset className="flex flex-col flex-1">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-soft">
        <div className="flex items-center justify-between px-6 py-3">
          <KeyboardShortcuts />
          <div className="flex items-center gap-2">
            {activeTab === 'gantt' && (
              <Select
                value={config.timeHorizon.toString()}
                onValueChange={(v) =>
                  setConfig((prev) => ({ ...prev, timeHorizon: Number(v) }))
                }
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Week</SelectItem>
                  <SelectItem value="30">Month</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAIAssistant(!showAIAssistant)}
              className={showAIAssistant ? "bg-primary text-primary-foreground" : ""}
            >
              <Bot className="w-4 h-4 mr-1" />
              AI Assistant
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <OperationHistoryControls />
          </div>
        </div>
      </div>

      <BreadcrumbNav />

      <div
        className={`grid gap-4 p-4 lg:p-6 h-[calc(100vh-56px)] overflow-hidden transition-all ${
          isControlPanelCollapsed
            ? showAIAssistant
              ? "grid-cols-[1fr_350px]"
              : "grid-cols-1"
            : showAIAssistant
            ? "grid-cols-[1fr_350px_400px]"
            : "grid-cols-[1fr_400px]"
        }`}
      >
        <div className="space-y-4">
          {/* Schedule */}
          <section className="border border-white/10 rounded-xl shadow-medium glass-panel flex flex-col flex-1">
  {isLoading ? (
    <div className="h-full flex flex-col items-center justify-center space-y-6 gradient-surface">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-primary/20"></div>
                      <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-lg font-semibold text-foreground">Loading Schedule</h3>
                      <p className="text-sm text-muted-foreground">Preparing your scheduling environment...</p>
                    </div>
                  </div>
  ) : (
    <>
      <div className="top-0 z-20 bg-background border-b shadow-sm">
      </div>
      <div className="flex-1">
        <div className="min-w-[1200px] ">
          <TabView tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
            {isPerformanceMode ? (
              <EnhancedGanttChart
                jobs={jobs}
                machines={machines}
                startDate={ganttStartDate}
                days={config.timeHorizon}
                onJobUpdate={handleJobUpdate}
                filters={filters}
              />
            ) : (
              <GanttChart
                startDate={ganttStartDate}
                days={config.timeHorizon}
                onJobUpdate={handleJobUpdate}
              />
            )}
            <CardView machines={machines} filters={filters} />
            <UnifiedCalendarView
              jobs={jobs}
              machines={machines}
              filters={filters}
              onJobUpdate={handleJobUpdate}
            />
            <EnhancedConflictDetection
              jobs={jobs}
              machines={machines}
              onJobUpdate={handleJobUpdate}
              onConflictResolved={() => toast.success("Conflict auto-resolved")}
            />
          </TabView>
        </div>
      </div>
    </>
  )}
</section>


        </div>

        {showAIAssistant && (
          <div className="space-y-4 border-l pl-4">
            <AIAssistantPanel
              jobs={jobs}
              machines={machines}
              onJobSuggestion={(jobId, suggestion) => {
                toast.success("AI suggestion applied", {
                  description: `Applied suggestion for job ${jobId}`
                });
              }}
            />
          </div>
        )}
      </div>
    </SidebarInset>

    <UnifiedControlPanel
      jobs={jobs}
      machines={machines}
      isCollapsed={isControlPanelCollapsed}
      onToggle={() => setIsControlPanelCollapsed(!isControlPanelCollapsed)}
      onFilterChange={newFilters => setFilters({ ...filters, ...newFilters })}
      config={config}
      onConfigChange={setConfig}
      onApplyConfig={() => toast.success("Configuration applied")}
      onResetConfig={() => toast.info("Configuration reset")}
      onResolveConflict={handleResolveConflict}
      currentFilters={filters}
      onApplyView={setFilters}
    />

    <FloatingActionButton />
  </ResponsiveContainer>
</SidebarProvider>


  );
};

const Index = () => (
  <OperationHistoryProvider>
    <PerformanceProvider>
      <TooltipProvider>
        <IndexContent />
      </TooltipProvider>
    </PerformanceProvider>
  </OperationHistoryProvider>
);

export default Index;