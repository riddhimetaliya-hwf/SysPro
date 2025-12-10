import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import { Button } from '@/components/UI/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Job, Machine } from '@/types/jobs';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  BarChart3,
  Target,
  Zap,
  Users,
  Gauge
} from 'lucide-react';
import { format, subDays, eachDayOfInterval } from 'date-fns';

interface PerformanceAnalyticsDashboardProps {
  jobs: Job[];
  machines: Machine[];
  analyticsData: any;
  timeRange: "daily" | "weekly" | "monthly";
  onTimeRangeChange: (value: "daily" | "weekly" | "monthly") => void;
}

interface KPI {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

interface BottleneckData {
  machineId: string;
  machineName: string;
  utilization: number;
  queueLength: number;
  avgWaitTime: number;
  impactScore: number;
  status: 'critical' | 'warning' | 'normal';
}

interface TrendDataPoint {
  date: string;
  efficiency: number;
  utilization: number;
  throughput: number;
  conflicts: number;
}

export const PerformanceAnalyticsDashboard = ({ jobs, machines, analyticsData, timeRange, onTimeRangeChange }: PerformanceAnalyticsDashboardProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1d' | '7d' | '30d'>('7d');
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Calculate Real-time KPIs
  const kpis = useMemo((): KPI[] => {
    if (analyticsData?.kpIs) {
      return [
        {
          id: 'oee',
          name: 'Overall Equipment Effectiveness',
          value: analyticsData.kpIs.overallEquipmentEffectiveness,
          target: 85,
          unit: '%',
          trend: analyticsData.kpIs.overallEquipmentEffectiveness > 85 ? 'up' : 'stable',
          trendValue: 0,
          status: analyticsData.kpIs.overallEquipmentEffectiveness >= 85 ? 'excellent' : 
                 analyticsData.kpIs.overallEquipmentEffectiveness >= 70 ? 'good' : 'warning'
        },
        {
          id: 'utilization',
          name: 'Resource Utilization',
          value: analyticsData.kpIs.resourceUtilization,
          target: 75,
          unit: '%',
          trend: analyticsData.kpIs.resourceUtilization > 75 ? 'up' : 'stable',
          trendValue: 0,
          status: analyticsData.kpIs.resourceUtilization >= 85 ? 'excellent' : 
                 analyticsData.kpIs.resourceUtilization >= 70 ? 'good' : 'warning'
        },
        {
          id: 'ontime',
          name: 'On-Time Delivery',
          value: analyticsData.kpIs.onTimeDelivery,
          target: 95,
          unit: '%',
          trend: analyticsData.kpIs.onTimeDelivery > 95 ? 'up' : 'stable',
          trendValue: 0,
          status: analyticsData.kpIs.onTimeDelivery >= 95 ? 'excellent' : 
                 analyticsData.kpIs.onTimeDelivery >= 80 ? 'good' : 'warning'
        },
        {
          id: 'efficiency',
          name: 'Schedule Efficiency',
          value: analyticsData.kpIs.scheduleEfficiency,
          target: 90,
          unit: '%',
          trend: analyticsData.kpIs.scheduleEfficiency > 90 ? 'up' : 'stable',
          trendValue: 0,
          status: analyticsData.kpIs.scheduleEfficiency >= 90 ? 'excellent' : 
                 analyticsData.kpIs.scheduleEfficiency >= 75 ? 'good' : 'warning'
        }
      ];
    }
    
    // Fallback to mock data when API data is not available
    const totalJobs = jobs.length;
    const completedJobs = jobs.filter(j => j.status === 'Completed').length;
    const conflictJobs = jobs.filter(j => j.conflictType !== 'none').length;
    const inProgressJobs = jobs.filter(j => j.status === 'In Progress').length;

    // Overall Equipment Effectiveness (OEE)
    const oee = Math.min(100, ((completedJobs + inProgressJobs) / Math.max(totalJobs, 1)) * 100);
    
    // Resource Utilization
    const utilization = machines.reduce((sum, machine) => {
      const machineJobs = jobs.filter(j => j.machineId === machine.id);
      return sum + Math.min(100, (machineJobs.length / machine.capacity) * 100);
    }, 0) / machines.length;

    // On-time Delivery Rate
    const onTimeRate = Math.max(0, 100 - (conflictJobs / Math.max(totalJobs, 1)) * 100);

    // Schedule Efficiency
    const efficiency = Math.max(0, 100 - (conflictJobs * 15) - (utilization > 85 ? (utilization - 85) * 2 : 0));

    return [
      {
        id: 'oee',
        name: 'Overall Equipment Effectiveness',
        value: oee,
        target: 85,
        unit: '%',
        trend: oee > 85 ? 'up' : oee > 70 ? 'stable' : 'down',
        trendValue: Math.random() * 5 - 2.5, // Mock trend
        status: oee >= 85 ? 'excellent' : oee >= 70 ? 'good' : oee >= 50 ? 'warning' : 'critical'
      },
      {
        id: 'utilization',
        name: 'Resource Utilization',
        value: utilization,
        target: 75,
        unit: '%',
        trend: utilization > 75 ? 'up' : 'stable',
        trendValue: Math.random() * 3,
        status: utilization >= 70 && utilization <= 85 ? 'excellent' : utilization >= 60 ? 'good' : 'warning'
      },
      {
        id: 'ontime',
        name: 'On-Time Delivery',
        value: onTimeRate,
        target: 95,
        unit: '%',
        trend: conflictJobs === 0 ? 'up' : 'down',
        trendValue: conflictJobs * -2,
        status: onTimeRate >= 95 ? 'excellent' : onTimeRate >= 85 ? 'good' : onTimeRate >= 70 ? 'warning' : 'critical'
      },
      {
        id: 'efficiency',
        name: 'Schedule Efficiency',
        value: efficiency,
        target: 90,
        unit: '%',
        trend: efficiency > 85 ? 'up' : 'stable',
        trendValue: Math.random() * 4 - 2,
        status: efficiency >= 90 ? 'excellent' : efficiency >= 80 ? 'good' : efficiency >= 65 ? 'warning' : 'critical'
      }
    ];
  }, [jobs, machines, analyticsData, lastUpdate]);

  // Bottleneck Detection
  const bottlenecks = useMemo((): BottleneckData[] => {
    if (analyticsData?.machineMetrics?.length) {
      return analyticsData.machineMetrics.map(machine => ({
        machineId: machine.workCentre,
        machineName: machine.workCentreDesc,
        utilization: machine.utilization,
        queueLength: machine.queueLength,
        avgWaitTime: typeof machine.avgWaitTime === 'string' 
          ? parseFloat(machine.avgWaitTime.replace(/[^\d.]/g, '')) || 0
          : Number(machine.avgWaitTime) || 0,
        impactScore: machine.impactScore,
        status: machine.status.toLowerCase() as 'critical' | 'warning' | 'normal'
      }));
    }

    // Fallback to mock data when API data is not available
    return machines.map(machine => {
      const machineJobs = jobs.filter(j => j.machineId === machine.id);
      const utilization = Math.min(100, (machineJobs.length / machine.capacity) * 100);
      const queueLength = machineJobs.filter(j => j.status === 'Pending').length;
      const avgWaitTime = queueLength * 2.5; // Mock calculation
      
      // Impact score considers utilization, queue, and downstream effects
      const downstreamJobs = jobs.filter(j => 
        j.dependencies?.some(dep => machineJobs.some(mj => mj.id === dep))
      ).length;
      const impactScore = Math.min(100, utilization + (queueLength * 10) + (downstreamJobs * 5));

      let status: 'critical' | 'warning' | 'normal' = 'normal';
      if (impactScore >= 80 || utilization >= 95) status = 'critical';
      else if (impactScore >= 60 || utilization >= 85) status = 'warning';

      return {
        machineId: machine.id,
        machineName: machine.name,
        utilization,
        queueLength,
        avgWaitTime,
        impactScore,
        status
      };
    }).sort((a, b) => b.impactScore - a.impactScore);
  }, [jobs, machines, analyticsData]);

  // Efficiency Trends
  const trendData = useMemo((): TrendDataPoint[] => {
    if (analyticsData?.metricsByTimePeriod?.length) {
      return analyticsData.metricsByTimePeriod.map(metric => ({
        date: metric.period,
        efficiency: metric.utilizationRate * 100 || 0,
        utilization: metric.utilizationRate * 100 || 0,
        throughput: metric.jobsCompleted || 0,
        conflicts: 0 // Not available in current API
      }));
    }

    // Fallback to mock data when API data is not available
    const days = selectedTimeframe === '1d' ? 1 : selectedTimeframe === '7d' ? 7 : 30;
    const dates = eachDayOfInterval({
      start: subDays(new Date(), days - 1),
      end: new Date()
    });

    return dates.map(date => ({
      date: format(date, 'MMM d'),
      efficiency: 75 + Math.random() * 20,
      utilization: 65 + Math.random() * 25,
      throughput: 80 + Math.random() * 15,
      conflicts: Math.floor(Math.random() * 8)
    }));
  }, [analyticsData, selectedTimeframe]);

  const getKPIStatusColor = (status: KPI['status']) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable': return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-gradient">Performance Analytics</h2>
          <Badge variant="outline" className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Live Data
          </Badge>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-xs text-muted-foreground">
            Last updated: {format(lastUpdate, 'HH:mm:ss')}
          </div>
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
        </div>
      </div>

      {/* Real-time KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <Card key={kpi.id} className={`border-l-4 ${getKPIStatusColor(kpi.status)}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{kpi.name}</CardTitle>
                {getTrendIcon(kpi.trend)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold">{kpi.value.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">{kpi.unit}</span>
                  <span className={`text-xs font-medium ${
                    kpi.trend === 'up' ? 'text-green-600' : 
                    kpi.trend === 'down' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {kpi.trendValue > 0 ? '+' : ''}{kpi.trendValue.toFixed(1)}%
                  </span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Target: {kpi.target}{kpi.unit}</span>
                    <span className={`font-medium ${
                      kpi.value >= kpi.target ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {kpi.value >= kpi.target ? 'On Target' : 'Below Target'}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(100, (kpi.value / kpi.target) * 100)} 
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="bottlenecks" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bottlenecks" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Analysis
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Efficiency Trends
          </TabsTrigger>
          <TabsTrigger value="realtime" className="flex items-center gap-2">
            <Gauge className="w-4 h-4" />
            Real-time Metrics
          </TabsTrigger>
        </TabsList>

        {/* Bottleneck Detection */}
        <TabsContent value="bottlenecks" className="space-y-4">
          <div className="grid gap-4">
            {bottlenecks.map(bottleneck => (
              <Card key={bottleneck.machineId} className={`${
                bottleneck.status === 'critical' ? 'border-red-200 bg-red-50/50' :
                bottleneck.status === 'warning' ? 'border-yellow-200 bg-yellow-50/50' :
                'border-green-200 bg-green-50/50'
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      {bottleneck.machineName}
                    </CardTitle>
                    <Badge variant={
                      bottleneck.status === 'critical' ? 'destructive' :
                      bottleneck.status === 'warning' ? 'secondary' : 'default'
                    }>
                      {bottleneck.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Utilization</div>
                      <div className={`text-xl font-bold ${
                        bottleneck.utilization >= 95 ? 'text-red-600' :
                        bottleneck.utilization >= 85 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {bottleneck.utilization.toFixed(1)}%
                      </div>
                      <Progress value={bottleneck.utilization} className="h-2" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Queue Length</div>
                      <div className="text-xl font-bold">{bottleneck.queueLength}</div>
                      <div className="text-xs text-muted-foreground">pending jobs</div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Avg Wait Time</div>
                      <div className="text-xl font-bold">{bottleneck.avgWaitTime.toFixed(1)}h</div>
                    </div>
                    
                    {/* <div className="space-y-1">
                      <div className="text-sm font-medium">Impact Score</div>
                      <div className={`text-xl font-bold ${
                        bottleneck.impactScore >= 80 ? 'text-red-600' :
                        bottleneck.impactScore >= 60 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {bottleneck.impactScore.toFixed(0)}/100
                      </div>
                      <Progress value={bottleneck.impactScore} className="h-2" />
                    </div> */}
                  </div>
                  
                  {bottleneck.status !== 'normal' && (
                    <div className="mt-4 p-3 bg-white/70 rounded-lg border">
                      <div className="flex items-start gap-2">
                        <Target className="w-4 h-4 mt-0.5 text-blue-500" />
                        <div className="text-sm">
                          <div className="font-medium mb-1">Optimization Suggestions:</div>
                          {bottleneck.status === 'critical' ? (
                            <ul className="text-xs space-y-1 text-gray-700">
                              <li>• Immediately redistribute {bottleneck.queueLength} pending jobs</li>
                              <li>• Consider adding overtime or additional resources</li>
                              <li>• Review job priorities and dependencies</li>
                            </ul>
                          ) : (
                            <ul className="text-xs space-y-1 text-gray-700">
                              <li>• Monitor utilization closely</li>
                              <li>• Consider load balancing with other machines</li>
                              <li>• Schedule preventive maintenance during low demand</li>
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Efficiency Trends */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends - Last {selectedTimeframe}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-700">Avg Efficiency</div>
                    <div className="text-2xl font-bold text-blue-900">
                      {(trendData.reduce((sum, d) => sum + d.efficiency, 0) / trendData.length).toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-sm font-medium text-green-700">Avg Utilization</div>
                    <div className="text-2xl font-bold text-green-900">
                      {(trendData.reduce((sum, d) => sum + d.utilization, 0) / trendData.length).toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-sm font-medium text-purple-700">Avg Throughput</div>
                    <div className="text-2xl font-bold text-purple-900">
                      {(trendData.reduce((sum, d) => sum + d.throughput, 0) / trendData.length).toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="text-sm font-medium text-orange-700">Total Conflicts</div>
                    <div className="text-2xl font-bold text-orange-900">
                      {trendData.reduce((sum, d) => sum + d.conflicts, 0)}
                    </div>
                  </div>
                </div>
                
                {/* Simple trend visualization */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">Efficiency Trend</div>
                  <div className="flex items-end gap-1 h-32 p-4 bg-gradient-to-t from-blue-50 to-transparent rounded-lg">
                    {trendData.map((point, index) => (
                      <div
                        key={index}
                        className="flex-1 bg-blue-500 rounded-t"
                        style={{ height: `${(point.efficiency / 100) * 100}%` }}
                        title={`${point.date}: ${point.efficiency.toFixed(1)}%`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{trendData[0]?.date}</span>
                    <span>{trendData[trendData.length - 1]?.date}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Real-time Metrics */}
        <TabsContent value="realtime" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Overall System Status</span>
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Healthy
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Active Jobs</span>
                    <span className="font-medium">{jobs.filter(j => j.status === 'In Progress').length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pending Jobs</span>
                    <span className="font-medium">{jobs.filter(j => j.status === 'Pending').length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Machines Online</span>
                    <span className="font-medium">{machines.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Active Conflicts</span>
                    <span className="font-medium text-red-600">
                      {jobs.filter(j => j.conflictType !== 'none').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Performance Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {bottlenecks.filter(b => b.status !== 'normal').slice(0, 3).map(bottleneck => (
                  <div key={bottleneck.machineId} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                    <AlertTriangle className={`w-4 h-4 ${
                      bottleneck.status === 'critical' ? 'text-red-500' : 'text-yellow-500'
                    }`} />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{bottleneck.machineName}</div>
                      <div className="text-xs text-muted-foreground">
                        {bottleneck.utilization.toFixed(0)}% utilized, {bottleneck.queueLength} queued
                      </div>
                    </div>
                    <Badge variant={bottleneck.status === 'critical' ? 'destructive' : 'secondary'}>
                      {bottleneck.status}
                    </Badge>
                  </div>
                ))}
                {bottlenecks.filter(b => b.status !== 'normal').length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p className="text-sm">No performance alerts</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};