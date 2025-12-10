import React, { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/Layout/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/UI/sidebar';
import { ResponsiveContainer } from '@/components/Layout/ResponsiveContainer';
import { BreadcrumbNav } from '@/components/Navigation/BreadcrumbNav';
import { GlobalSearch } from '@/components/Navigation/GlobalSearch';
import { KeyboardShortcuts } from '@/components/Navigation/KeyboardShortcuts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Badge } from '@/components/UI/badge';
import { Progress } from '@/components/UI/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer as RechartsResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertTriangle, 
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Settings,
  Download,
  Filter,
  RefreshCw,
  Zap,
  Target,
  Crown,
  CheckCircle
} from 'lucide-react';
import { generateMockJobs, mockMachines } from '@/data/mockData';
import { usePerformance } from '@/contexts/PerformanceContext';
import { PerformanceAnalyticsDashboard } from '@/components/Performance/PerformanceAnalyticsDashboard';
import { OptimizationEngine } from '@/components/Performance/OptimizationEngine';
import { ConflictAlertsPanel } from '@/components/Performance/ConflictAlertsPanel';
import { UtilizationAnalytics } from '@/components/Analytics/UtilizationAnalytics';
import { CustomDashboard } from '@/components/Analytics/CustomDashboard';
import { toast } from 'sonner';
import { apiService, PerformanceAnalytics } from '@/services/api';

const Analytics = () => {
  const { isPerformanceMode } = usePerformance();
  const [jobs] = useState(generateMockJobs(30));
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1d' | '7d' | '30d'>('7d');
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [analyticsData, setAnalyticsData] = useState<PerformanceAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Enhanced analytics data
  const utilizationData = {
    daily: [
      { name: 'Mon', Machine_A: 85, Machine_B: 72, Machine_C: 95, idle: 15, efficiency: 88 },
      { name: 'Tue', Machine_A: 78, Machine_B: 88, Machine_C: 82, idle: 20, efficiency: 83 },
      { name: 'Wed', Machine_A: 92, Machine_B: 65, Machine_C: 88, idle: 12, efficiency: 92 },
      { name: 'Thu', Machine_A: 88, Machine_B: 90, Machine_C: 75, idle: 18, efficiency: 85 },
      { name: 'Fri', Machine_A: 95, Machine_B: 85, Machine_C: 92, idle: 8, efficiency: 94 }
    ],
    weekly: [
      { name: 'Week 1', Machine_A: 85, Machine_B: 78, Machine_C: 88, idle: 15, efficiency: 84 },
      { name: 'Week 2', Machine_A: 92, Machine_B: 85, Machine_C: 82, idle: 12, efficiency: 86 },
      { name: 'Week 3', Machine_A: 88, Machine_B: 92, Machine_C: 95, idle: 10, efficiency: 92 },
      { name: 'Week 4', Machine_A: 90, Machine_B: 88, Machine_C: 85, idle: 13, efficiency: 88 }
    ],
    monthly: [
      { name: 'Jan', Machine_A: 88, Machine_B: 85, Machine_C: 90, idle: 12, efficiency: 88 },
      { name: 'Feb', Machine_A: 92, Machine_B: 88, Machine_C: 85, idle: 10, efficiency: 89 },
      { name: 'Mar', Machine_A: 85, Machine_B: 92, Machine_C: 88, idle: 15, efficiency: 86 }
    ]
  };

  const performanceMetrics = [
    { 
      name: 'Overall Efficiency', 
      value: 87, 
      change: +3.2, 
      trend: 'up',
      icon: TrendingUp,
      color: 'text-green-500',
      gradient: 'from-green-400 to-green-600'
    },
    { 
      name: 'On-Time Delivery', 
      value: 94, 
      change: +1.8, 
      trend: 'up',
      icon: Clock,
      color: 'text-blue-500',
      gradient: 'from-blue-400 to-blue-600'
    },
    { 
      name: 'Resource Utilization', 
      value: 82, 
      change: -2.1, 
      trend: 'down',
      icon: Activity,
      color: 'text-orange-500',
      gradient: 'from-orange-400 to-orange-600'
    },
    { 
      name: 'Quality Rate', 
      value: 98.5, 
      change: +0.3, 
      trend: 'up',
      icon: CheckCircle,
      color: 'text-purple-500',
      gradient: 'from-purple-400 to-purple-600'
    }
  ];

  const machineStatusData = [
    { name: 'Active', value: 75, color: '#10b981' },
    { name: 'Idle', value: 15, color: '#f59e0b' },
    { name: 'Maintenance', value: 8, color: '#ef4444' },
    { name: 'Setup', value: 2, color: '#6366f1' }
  ];

  const productionTrendData = [
    { date: '2024-01', planned: 1200, actual: 1150, efficiency: 95.8 },
    { date: '2024-02', planned: 1300, actual: 1280, efficiency: 98.5 },
    { date: '2024-03', planned: 1250, actual: 1200, efficiency: 96.0 },
    { date: '2024-04', planned: 1400, actual: 1350, efficiency: 96.4 },
    { date: '2024-05', planned: 1350, actual: 1320, efficiency: 97.8 },
    { date: '2024-06', planned: 1500, actual: 1485, efficiency: 99.0 }
  ];

  const bottleneckAnalysis = [
    { machine: 'Machine A', bottleneckHours: 24, impactedJobs: 8, severity: 'critical' },
    { machine: 'Machine B', bottleneckHours: 12, impactedJobs: 3, severity: 'moderate' },
    { machine: 'Machine C', bottleneckHours: 6, impactedJobs: 2, severity: 'low' },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'moderate': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'moderate': return 'secondary';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  // Fetch performance analytics data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.fetchPerformanceAnalytics(selectedTimeframe);
        setAnalyticsData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch performance analytics:', err);
        setError('Failed to load performance analytics. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedTimeframe]);

  return (
    <SidebarProvider>
      <ResponsiveContainer className="min-h-screen flex w-full">
        <AppSidebar />
        
        <SidebarInset className="flex flex-col flex-1">
          {/* Enhanced Header for Performance Mode */}
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  {isPerformanceMode ? 'Advanced Analytics Suite' : 'Analytics Dashboard'}
                  {isPerformanceMode && (
                    <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-[#81C341]/10 to-[#008FB5]/10 text-black">
                      <Crown className="w-3 h-3 mr-1" />
                      PERFORMANCE MODE
                    </Badge>
                  )}
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  {['1d', '7d', '30d'].map(period => (
                    <Button
                      key={period}
                      variant={selectedTimeframe === period ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTimeframe(period as typeof selectedTimeframe)}
                    >
                      {period}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
                <GlobalSearch />
                <KeyboardShortcuts />
              </div>
            </div>
          </div>

          <BreadcrumbNav />
          
          {/* Unified Analytics Content */}
          <div className="flex-1 overflow-hidden">
            {isPerformanceMode ? (
              // Performance Mode - Advanced Analytics Suite
              <Tabs defaultValue="performance" className="h-full flex flex-col">
                <div className="border-b px-6">
                  <TabsList className="grid w-full max-w-4xl grid-cols-6">
                    <TabsTrigger value="performance" className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Performance
                    </TabsTrigger>
                    <TabsTrigger value="optimization" className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Optimization
                    </TabsTrigger>
                    <TabsTrigger value="alerts" className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Smart Alerts
                    </TabsTrigger>
                    <TabsTrigger value="utilization" className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Utilization
                    </TabsTrigger>
                    <TabsTrigger value="trends" className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Trends
                    </TabsTrigger>
                    <TabsTrigger value="custom" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Custom
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-auto">
                  {/* Performance Analytics */}
                  <TabsContent value="performance" className="h-full p-6">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : error ? (
                      <div className="text-center py-10 text-red-500">
                        <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                        <p>{error}</p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => window.location.reload()}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Retry
                        </Button>
                      </div>
                    ) : (
                      <PerformanceAnalyticsDashboard
                        jobs={jobs}
                        machines={mockMachines}
                        analyticsData={analyticsData}
                        timeRange={timeRange}
                        onTimeRangeChange={setTimeRange}
                      />
                    )}
                  </TabsContent>

                  {/* Optimization Engine */}
                  <TabsContent value="optimization" className="h-full p-6">
                    <OptimizationEngine
                      jobs={jobs}
                      machines={mockMachines}
                      onJobsOptimized={(optimizedJobs) => {
                        console.log('Jobs optimized from Analytics:', optimizedJobs);
                        toast.success('Schedule optimized successfully from Analytics Suite!');
                      }}
                    />
                  </TabsContent>

                  {/* Smart Alerts */}
                  <TabsContent value="alerts" className="h-full p-6">
                    <ConflictAlertsPanel
                      jobs={jobs}
                      machines={mockMachines}
                      onResolveConflict={(jobId) => {
                        console.log('Resolving conflict for job:', jobId);
                        toast.success(`Conflict resolved for job ${jobId}`);
                      }}
                    />
                  </TabsContent>

                  {/* Enhanced Utilization */}
                  <TabsContent value="utilization" className="h-full p-6">
                    <div className="grid gap-6">
                      <UtilizationAnalytics jobs={jobs} machines={mockMachines} />
                      
                      {/* Additional Performance Utilization Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Machine Efficiency</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {mockMachines.slice(0, 4).map(machine => {
                                const efficiency = 70 + Math.random() * 25;
                                return (
                                  <div key={machine.id} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span>{machine.name}</span>
                                      <span className="font-medium">{efficiency.toFixed(1)}%</span>
                                    </div>
                                    <Progress value={efficiency} className="h-2" />
                                  </div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Resource Allocation</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                  {Math.round((jobs.filter(j => j.status === 'In Progress').length / jobs.length) * 100)}%
                                </div>
                                <div className="text-xs text-muted-foreground">Active Jobs</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                  {Math.round((jobs.filter(j => j.status === 'Completed').length / jobs.length) * 100)}%
                                </div>
                                <div className="text-xs text-muted-foreground">Completed</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600">
                                  {Math.round((jobs.filter(j => j.conflictType !== 'none').length / jobs.length) * 100)}%
                                </div>
                                <div className="text-xs text-muted-foreground">Conflicts</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Performance Score</CardTitle>
                          </CardHeader>
                          <CardContent className="text-center">
                            <div className="relative w-24 h-24 mx-auto mb-4">
                              <div className="absolute inset-0 rounded-full border-8 border-muted"></div>
                              <div 
                                className="absolute inset-0 rounded-full border-8 border-primary border-r-transparent border-b-transparent transform rotate-45"
                                style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
                              ></div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xl font-bold">89</span>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">Overall Performance</div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Standard Utilization Charts Enhanced */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Enhanced Machine Utilization</CardTitle>
                            <CardDescription>Real-time utilization with Performance Mode intelligence</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <RechartsResponsiveContainer width="100%" height={300}>
                              <BarChart data={utilizationData[timeRange]}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="Machine_A" fill="#3b82f6" name="Machine A" />
                                <Bar dataKey="Machine_B" fill="#10b981" name="Machine B" />
                                <Bar dataKey="Machine_C" fill="#f59e0b" name="Machine C" />
                              </BarChart>
                            </RechartsResponsiveContainer>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Efficiency Trends with AI Insights</CardTitle>
                            <CardDescription>Performance Mode predictive analysis</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <RechartsResponsiveContainer width="100%" height={300}>
                              <LineChart data={utilizationData[timeRange]}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={3} name="Efficiency %" />
                              </LineChart>
                            </RechartsResponsiveContainer>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Enhanced Trends */}
                  <TabsContent value="trends" className="h-full p-6">
                    <div className="grid gap-6">
                      {/* Performance Metrics Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {performanceMetrics.map((metric, index) => (
                          <Card key={metric.name} className="relative overflow-hidden">
                            <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-5`}></div>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">
                                {metric.name}
                              </CardTitle>
                              <metric.icon className={`h-4 w-4 ${metric.color}`} />
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">{metric.value}%</div>
                              <p className="text-xs text-muted-foreground">
                                <span className={metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                                  {metric.change > 0 ? '+' : ''}{metric.change}%
                                </span>
                                {' '}from last period
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {/* Advanced Charts for Performance Mode */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Production vs. Planned (Performance Mode)</CardTitle>
                            <CardDescription>
                              Advanced production tracking with predictive analytics
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <RechartsResponsiveContainer width="100%" height={300}>
                              <AreaChart data={productionTrendData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="planned" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} name="Planned" />
                                <Area type="monotone" dataKey="actual" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.8} name="Actual" />
                              </AreaChart>
                            </RechartsResponsiveContainer>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Bottleneck Impact Analysis</CardTitle>
                            <CardDescription>
                              Real-time bottleneck detection with Performance Mode intelligence
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {bottleneckAnalysis.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                  <div className="flex items-center gap-4">
                                    <div className={`w-3 h-3 rounded-full ${getSeverityColor(item.severity)}`} />
                                    <div>
                                      <div className="font-medium">{item.machine}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {item.bottleneckHours} hours of bottleneck time
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="text-right">
                                      <div className="text-sm font-medium">{item.impactedJobs} jobs impacted</div>
                                      <Badge variant={getSeverityBadge(item.severity)}>
                                        {item.severity}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Custom Analytics */}
                  <TabsContent value="custom" className="h-full p-6">
                    <CustomDashboard />
                  </TabsContent>
                </div>
              </Tabs>
            ) : (
              // Standard Mode - Basic Analytics
              <div className="flex-1 p-6 space-y-6">
                {/* Key Performance Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {performanceMetrics.map((metric, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">{metric.name}</p>
                            <p className="text-2xl font-bold">{metric.value}%</p>
                          </div>
                          <div className={`flex items-center gap-1 text-sm ${
                            metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {metric.trend === 'up' ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            {Math.abs(metric.change)}%
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Upgrade Notice */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Crown className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-primary">Unlock Advanced Analytics Suite</h3>
                        <p className="text-sm text-muted-foreground">
                          Get performance optimization, real-time bottleneck detection, smart alerts, and predictive analytics with Performance Mode.
                        </p>
                      </div>
                      <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                        Upgrade to Performance Mode
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Basic Analytics Tabs */}
                <Tabs defaultValue="utilization" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="utilization" className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Utilization
                    </TabsTrigger>
                    <TabsTrigger value="performance" className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Performance
                    </TabsTrigger>
                    <TabsTrigger value="trends" className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Trends
                    </TabsTrigger>
                    <TabsTrigger value="bottlenecks" className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Bottlenecks
                    </TabsTrigger>
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                      <PieChartIcon className="w-4 h-4" />
                      Overview
                    </TabsTrigger>
                  </TabsList>

                  {/* Time Range Controls */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Time Range:</span>
                    {(['daily', 'weekly', 'monthly'] as const).map(range => (
                      <Button
                        key={range}
                        variant={timeRange === range ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTimeRange(range)}
                        className="capitalize"
                      >
                        {range}
                      </Button>
                    ))}
                  </div>

                  <TabsContent value="utilization" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Machine Utilization - {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <RechartsResponsiveContainer width="100%" height={300}>
                            <BarChart data={utilizationData[timeRange]}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="Machine_A" fill="#3b82f6" name="Machine A" />
                              <Bar dataKey="Machine_B" fill="#10b981" name="Machine B" />
                              <Bar dataKey="Machine_C" fill="#f59e0b" name="Machine C" />
                            </BarChart>
                          </RechartsResponsiveContainer>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Idle Time Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <RechartsResponsiveContainer width="100%" height={300}>
                            <LineChart data={utilizationData[timeRange]}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Line type="monotone" dataKey="idle" stroke="#ef4444" strokeWidth={3} name="Idle Time %" />
                            </LineChart>
                          </RechartsResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="performance" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Production vs. Planned</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <RechartsResponsiveContainer width="100%" height={400}>
                          <AreaChart data={productionTrendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="planned" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} name="Planned" />
                            <Area type="monotone" dataKey="actual" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.8} name="Actual" />
                          </AreaChart>
                        </RechartsResponsiveContainer>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="trends" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Efficiency Trends</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <RechartsResponsiveContainer width="100%" height={400}>
                          <LineChart data={productionTrendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={[90, 100]} />
                            <Tooltip />
                            <Line type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={3} name="Efficiency %" />
                          </LineChart>
                        </RechartsResponsiveContainer>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="bottlenecks" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Bottleneck Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {bottleneckAnalysis.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full ${getSeverityColor(item.severity)}`} />
                                <div>
                                  <div className="font-medium">{item.machine}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {item.bottleneckHours} hours of bottleneck time
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-sm font-medium">{item.impactedJobs} jobs impacted</div>
                                  <Badge variant={getSeverityBadge(item.severity)}>
                                    {item.severity}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Machine Status Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <RechartsResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={machineStatusData}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                dataKey="value"
                                label={({ name, value }) => `${name}: ${value}%`}
                              >
                                {machineStatusData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </RechartsResponsiveContainer>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Resource Utilization by Machine</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {mockMachines.map(machine => (
                            <div key={machine.id} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>{machine.name}</span>
                                <span>{Math.floor(Math.random() * 30 + 70)}%</span>
                              </div>
                              <Progress value={Math.floor(Math.random() * 30 + 70)} className="h-2" />
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </SidebarInset>
      </ResponsiveContainer>
    </SidebarProvider>
  );
};

export default Analytics;