import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/UI/badge';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { Job, Machine } from '@/types/jobs';
import { format, parseISO, isBefore, isAfter } from 'date-fns';
import { 
  AlertTriangle, 
  Clock, 
  Package, 
  Users, 
  Settings,
  RefreshCw,
  Zap,
  Search,
  Filter,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/services/api';
import { stripLeadingZeros } from '@/lib/utils';

interface ConflictDetectionRule {
  id: string;
  name: string;
  type: 'machine_overload' | 'capacity_exceed' | 'material_shortage' | 'resource_conflict' | 'dependency_violation';
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  autoResolve: boolean;
  parameters: Record<string, any>;
}

interface DetectedConflict {
  id: string;
  ruleId: string;
  type: ConflictDetectionRule['type'];
  severity: ConflictDetectionRule['severity'];
  title: string;
  description: string;
  affectedJobs: string[];
  affectedMachines: string[];
  detectedAt: Date;
  resolutionOptions: {
    id: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    estimatedTime: string;
    autoApplicable: boolean;
  }[];
  metrics: {
    impactScore: number;
    urgency: number;
    complexity: number;
  };
}

interface EnhancedConflictDetectionProps {
  jobs: Job[];
  machines: Machine[];
  onJobUpdate: (job: Job) => void;
  onConflictResolved: (conflictId: string) => void;
}

export const EnhancedConflictDetection = ({
  jobs,
  machines,
  onJobUpdate,
  onConflictResolved
}: EnhancedConflictDetectionProps) => {
  const [detectionRules, setDetectionRules] = useState<ConflictDetectionRule[]>([
    {
      id: 'rule-1',
      name: 'Machine Overload',
      type: 'machine_overload',
      enabled: true,
      severity: 'critical',
      autoResolve: false,
      parameters: { toleranceMinutes: 0 }
    }
  ]);

  const [detectedConflicts, setDetectedConflicts] = useState<DetectedConflict[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [lastScanTime, setLastScanTime] = useState<Date>(new Date());
  
  // 🔥 NEW: Add ref to prevent duplicate scans
  const isScanningRef = useRef(false);

  // strip leading zeros from jobId description
  const stripZerosFromText = (text: string): string => {
    if (!text) return text;
    return text.replace(/\b0+(\d+[a-zA-Z]*)\b/g, (match, digitsWithSuffix) => {
      return digitsWithSuffix;
    });
  };

  // Fetch conflicts directly from API
  const fetchApiConflicts = async (): Promise<DetectedConflict[]> => {
    try {
      console.log("🔄 Fetching conflicts from API...");
      
      const apiData = await apiService.fetchJobConflicts([]);
      
      console.log("📊 API Response Data:", apiData);

      if (!apiData || !Array.isArray(apiData)) {
        console.warn("⚠️ No conflicts data received from API");
        return [];
      }

      const conflicts: DetectedConflict[] = apiData.map((conflict: any, index: number) => {
        const jobId = conflict.job || conflict.Job || `job-${index}`;
        const machine = conflict.machine || conflict.Machine || 'Unknown Machine';
        const conflictReason = conflict.conflictReason || conflict.ConflictReason || 'Scheduling conflict detected';
        
        console.log(`🔍 Conflict ${index}:`);
        console.log(`   Raw jobId: "${jobId}" (type: ${typeof jobId})`);
        console.log(`   After stripLeadingZeros: "${stripLeadingZeros(jobId)}"`);
        console.log(`   Conflict object keys:`, Object.keys(conflict));
        console.log(`   Full conflict:`, conflict);

        const strippedJobId = stripLeadingZeros(jobId);
        const strippedDescription = stripLeadingZeros(conflictReason);

        return {
          id: `api-conflict-${jobId}-${index}-${Date.now()}`,
          ruleId: 'api-detection',
          type: mapApiConflictType(conflict),
          severity: mapApiSeverity(conflict),
          title: stripZerosFromText(getConflictTitle(conflict)),
          description: strippedDescription,
          affectedJobs: [stripLeadingZeros(jobId)],
          affectedMachines: machine ? [machine] : [],
          detectedAt: new Date(),
          resolutionOptions: getResolutionOptions(conflict),
          metrics: {
            impactScore: conflict.impactScore || conflict.ImpactScore || 5,
            urgency: mapUrgencyToScore(conflict.urgency || conflict.Urgency),
            complexity: mapComplexityToScore(conflict.complexity || conflict.Complexity)
          }
        };
      });

      console.log(`✅ Transformed ${conflicts.length} conflicts from API`);
      return conflicts;

    } catch (error) {
      console.error('🚨 Error fetching conflicts from API:', error);
      toast.error('Failed to fetch conflicts from server');
      return [];
    }
  };

  // Helper functions for data transformation
  const mapApiConflictType = (conflict: any): ConflictDetectionRule['type'] => {
    const reason = (conflict.ConflictReason || conflict.conflictReason || '').toLowerCase();
    if (reason.includes('machine') || reason.includes('overlap')) return 'resource_conflict';
    if (reason.includes('time') || reason.includes('schedule')) return 'machine_overload';
    if (reason.includes('capacity')) return 'capacity_exceed';
    return 'resource_conflict';
  };

  const mapApiSeverity = (conflict: any): ConflictDetectionRule['severity'] => {
    const impactScore = conflict.ImpactScore || conflict.impactScore || 0;
    const urgency = (conflict.Urgency || conflict.urgency || '').toLowerCase();
    
    if (impactScore >= 8 || urgency === 'critical') return 'critical';
    if (impactScore >= 6 || urgency === 'high') return 'high';
    if (impactScore >= 4 || urgency === 'medium') return 'medium';
    return 'low';
  };

  const getConflictTitle = (conflict: any): string => {
    const reason = conflict.ConflictReason || conflict.conflictReason;
    if (reason) {
      const mainReason = reason.split('-')[0]?.trim() || reason.split(':')[0]?.trim();
      return stripLeadingZeros(mainReason || 'Scheduling Conflict');
    }
    return `Conflict: ${stripLeadingZeros(conflict.Job || conflict.job)} on ${conflict.Machine || conflict.machine}`;
  };

  const getResolutionOptions = (conflict: any): DetectedConflict['resolutionOptions'] => {
    const baseOptions = [
      {
        id: 'reschedule',
        description: 'Reschedule job to resolve timing conflict',
        impact: 'medium' as const,
        estimatedTime: '30 min',
        autoApplicable: false
      },
      {
        id: 'reassign-machine',
        description: `Reassign to different machine`,
        impact: 'high' as const,
        estimatedTime: '15 min',
        autoApplicable: false
      }
    ];

    const reason = (conflict.ConflictReason || '').toLowerCase();
    if (reason.includes('machine conflict') || reason.includes('overlap')) {
      baseOptions.push({
        id: 'adjust-timing',
        description: 'Adjust start/end times to avoid overlap',
        impact: 'low' as const,
        estimatedTime: '10 min',
        autoApplicable: true
      });
    }

    return baseOptions;
  };

  const mapUrgencyToScore = (urgency: string): number => {
    switch (urgency?.toLowerCase()) {
      case 'critical': return 9;
      case 'high': return 7;
      case 'medium': return 5;
      case 'low': return 3;
      default: return 5;
    }
  };

  const mapComplexityToScore = (complexity: string): number => {
    switch (complexity?.toLowerCase()) {
      case 'high': return 8;
      case 'medium': return 5;
      case 'low': return 2;
      default: return 5;
    }
  };

  // 🔥 FIXED: Added guard to prevent duplicate scans
  const detectConflicts = async () => {
    // Prevent multiple simultaneous scans
    if (isScanningRef.current) {
      console.log("🚫 Scan already in progress, skipping...");
      return;
    }

    isScanningRef.current = true;
    setIsScanning(true);
    
    try {
      console.log("🔍 Starting conflict detection...");
      
      const apiConflicts = await fetchApiConflicts();
      
      console.log(`📈 API returned ${apiConflicts.length} conflicts`);

      const allConflicts = [...apiConflicts];

      setDetectedConflicts(allConflicts);
      setLastScanTime(new Date());
      
      if (allConflicts.length > 0) {
        toast.success(`Detected ${allConflicts.length} conflicts`, {
          description: 'Conflicts loaded from scheduling system'
        });
      } else {
        toast.success('No conflicts detected', {
          description: 'All schedules are conflict-free'
        });
      }
    } catch (error) {
      console.error('Error detecting conflicts:', error);
      toast.error('Failed to detect conflicts');
    } finally {
      setIsScanning(false);
      isScanningRef.current = false;
    }
  };

  const applyResolution = (conflict: DetectedConflict, option: DetectedConflict['resolutionOptions'][0]) => {
    toast.success(`Applying resolution: ${option.description}`, {
      description: `Estimated time: ${option.estimatedTime}`
    });
    
    setDetectedConflicts(prev => prev.filter(c => c.id !== conflict.id));
    onConflictResolved(conflict.id);
  };

  const getConflictIcon = (type: ConflictDetectionRule['type']) => {
    switch (type) {
      case 'machine_overload': return <Clock className="w-4 h-4" />;
      case 'capacity_exceed': return <AlertTriangle className="w-4 h-4" />;
      case 'material_shortage': return <Package className="w-4 h-4" />;
      case 'resource_conflict': return <Users className="w-4 h-4" />;
      case 'dependency_violation': return <Zap className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredConflicts = detectedConflicts.filter(conflict => {
    const severityMatch = filterSeverity === 'all' || conflict.severity === filterSeverity;
    const searchMatch = searchTerm === '' || 
      conflict.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conflict.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conflict.affectedJobs.some(job => job.toLowerCase().includes(searchTerm.toLowerCase()));
    return severityMatch && searchMatch;
  });

  // 🔥 FIXED: Auto-scan on component mount ONLY
  useEffect(() => {
    console.log("🚀 EnhancedConflictDetection mounted, starting initial scan...");
    detectConflicts();
    
    return () => {
      isScanningRef.current = false;
    };
  }, []); // Empty dependency array - only runs once on mount

  // 🔥 FIXED: Only trigger when the NUMBER of jobs changes, not the jobs array itself
  useEffect(() => {
    if (jobs.length > 0 && !isScanningRef.current) {
      const timer = setTimeout(() => {
        console.log("🔄 Jobs changed, refreshing conflicts...");
        detectConflicts();
      }, 3000); // Increased delay to prevent rapid firing
      return () => clearTimeout(timer);
    }
  }, [jobs.length]); // Only trigger when the NUMBER of jobs changes

  return (
    <div className="h-screen overflow-auto">
      <div className="space-y-6 p-4">
        {/* Header Controls */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Enhanced Conflict Detection
                <Badge variant="outline" className="ml-2">
                  Live API
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={detectConflicts}
                  disabled={isScanning}
                  size="sm"
                  variant="outline"
                >
                  {isScanning ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  {isScanning ? 'Scanning...' : 'Refresh'}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Search conflicts by job, machine, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Last scan: {format(lastScanTime, 'MMM d, HH:mm:ss')}</span>
              <span>{filteredConflicts.length} conflicts found</span>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="conflicts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="conflicts">Active Conflicts</TabsTrigger>
            <TabsTrigger value="rules">Detection Rules</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="conflicts" className="space-y-4">
            {filteredConflicts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Conflicts Detected</h3>
                  <p className="text-muted-foreground text-center">
                    All jobs are scheduled without conflicts. The system will continue monitoring for issues.
                  </p>
                  <Button 
                    onClick={detectConflicts} 
                    variant="outline" 
                    className="mt-4"
                    disabled={isScanning}
                  >
                    {isScanning ? 'Scanning...' : 'Check Again'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredConflicts.map(conflict => (
                  <Card key={conflict.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          {getConflictIcon(conflict.type)}
                          <div>
                            <h3 className="font-semibold text-lg">{conflict.title}</h3>
                            <p className="text-muted-foreground">{stripZerosFromText(conflict.description)}</p>
                            <div className="flex gap-2 mt-2">
                              {conflict.affectedJobs.map(jobId => (
                                <Badge key={jobId} variant="secondary" className="text-xs">
                                  Job: {stripLeadingZeros(jobId)}
                                </Badge>
                              ))}
                              {conflict.affectedMachines.map(machine => (
                                <Badge key={machine} variant="outline" className="text-xs">
                                  Machine: {machine}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Badge className={getSeverityColor(conflict.severity)}>
                          {conflict.severity.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                        <div>
                          <span className="font-medium">Impact Score:</span> {conflict.metrics.impactScore}/10
                        </div>
                        <div>
                          <span className="font-medium">Urgency:</span> {conflict.metrics.urgency}/10
                        </div>
                        <div>
                          <span className="font-medium">Complexity:</span> {conflict.metrics.complexity}/10
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium">Resolution Options:</h4>
                        {conflict.resolutionOptions.map(option => (
                          <div key={option.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div>
                              <p className="font-medium">{option.description}</p>
                              <p className="text-sm text-muted-foreground">
                                Impact: {option.impact} • Time: {option.estimatedTime}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            <div className="grid gap-4">
              {detectionRules.map(rule => (
                <Card key={rule.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{rule.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(rule.severity)}>
                          {rule.severity}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDetectionRules(prev => 
                              prev.map(r => r.id === rule.id ? { ...r, enabled: !r.enabled } : r)
                            );
                          }}
                        >
                          {rule.enabled ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-400" />}
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Type: {rule.type.replace('_', ' ')} • Auto-resolve: {rule.autoResolve ? 'Yes' : 'No'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{detectedConflicts.length}</div>
                  <div className="text-sm text-muted-foreground">Active Conflicts</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {detectionRules.filter(r => r.enabled).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Rules</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round((1 - detectedConflicts.length / Math.max(jobs.length, 1)) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Schedule Health</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};