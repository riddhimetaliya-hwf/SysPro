import React, { useEffect, useState } from "react";
import { Job, Machine } from "@/types/jobs";
import { Badge } from "@/components/UI/badge";
import { Button } from "@/components/UI/button";
import { ScrollArea } from "@/components/UI/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/UI/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { Switch } from "@/components/UI/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/UI/progress";
import { Link } from "react-router-dom";
import {
  X,
  AlertTriangle,
  Filter,
  Calendar,
  Activity,
  Settings,
  Plus,
  Trash2,
  Eye,
  Package,
  ShoppingCart,
  Users,
  AlertCircle,
  Clock,
  User,
  Sliders,
  CheckCircle,
  Zap,
  TrendingUp,
  Bookmark,
  RefreshCw,
  Search,
  Target,
  BarChart3,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { UtilizationAnalytics } from "@/components/Analytics/UtilizationAnalytics";
import { SavedViewsManager } from "@/components/Views/SavedViewsManager";
import { FilterOptions } from "@/types/jobs";
import { apiService } from "@/services/api";
import { config as envConfig } from "@/config/environment";

interface ConflictAlert {
  id: string;
  type: "overbooked" | "overlap" | "material" | "resource";
  severity: "critical" | "warning";
  title: string;
  description: string;
  jobId: string;
  suggestion: string;
  autoResolvable: boolean;
}

interface ERPData {
  materialStock: { [key: string]: number };
  workOrders: { id: string; status: string; deadline: Date }[];
  salesOrders: { id: string; deadline: Date; priority: string }[];
  shiftAvailability: { shift: string; available: number; total: number }[];
}

// New ERP interfaces
interface MaterialData {
  id: string;
  name: string;
  currentStock: number;
  requiredStock: number;
  unit: string;
  status: "available" | "low" | "critical" | "unavailable";
  eta?: string;
  cost: number;
  source?: string;
}

interface JobReadiness {
  jobId: string;
  name: string;
  materialStatus: "ready" | "missing" | "partial" | "delayed";
  personnelStatus: "ready" | "conflict" | "shortage";
  issues?: {
    material?: string[];
    personnel?: string[];
  };
}

interface UnifiedControlPanelProps {
  jobs: Job[];
  machines: Machine[];
  isCollapsed: boolean;
  onToggle: () => void;
  onFilterChange?: (filters: any) => void;
  config?: any;
  onConfigChange?: (config: any) => void;
  onApplyConfig?: () => void;
  onResetConfig?: () => void;
  onResolveConflict?: (jobId: string) => void;
  currentFilters: FilterOptions;
  onApplyView: (filters: FilterOptions) => void;
}

export interface SmartAlert {
  job: number;
  stockCode: string;
  stockDescription: string;
  materialPresent: number;
  materialRequired: number;
  impactScore: number;
}

export const UnifiedControlPanel = ({
  jobs,
  machines,
  isCollapsed,
  onToggle,
  onFilterChange,
  config,
  onConfigChange,
  onApplyConfig,
  onResetConfig,
  onResolveConflict,
  currentFilters,
  onApplyView,
}: UnifiedControlPanelProps) => {
  const [activeTab, setActiveTab] = useState("alerts");
  const [selectedFilters, setSelectedFilters] = useState({
    status: [] as string[],
    machine: [] as string[],
    jobType: [] as string[],
  });
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(
    new Set()
  );
  const [alertFilter, setAlertFilter] = useState<
    "all" | "critical" | "warning"
  >("all");
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [backendAlerts, setBackendAlerts] = useState<ConflictAlert[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedJobs, setSearchedJobs] = useState<Job[]>([]);
  const [searchedAlerts, setSearchedAlerts] = useState<ConflictAlert[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // New ERP state
  const [materialData, setMaterialData] = useState<MaterialData[]>([]);
  const [jobReadinessData, setJobReadinessData] = useState<JobReadiness[]>([]);
  const [erpLoading, setErpLoading] = useState(false);
  const [erpError, setErpError] = useState<string | null>(null);
  const [lastErpSync, setLastErpSync] = useState(new Date());
  const [retryCount, setRetryCount] = useState(0);

  // Build a quick lookup for job names from props
  const jobNameById = React.useMemo(() => {
    const map = new Map<string, string>();
    (jobs || []).forEach((j) => map.set(String(j.id), j.name));
    return map;
  }, [jobs]);

  // Fetch backend smart alerts
  useEffect(() => {
    setLoadingAlerts(true);
    // Fetch jobs for search
    apiService.fetchSchedulingData().then(({ jobs }) => {
      // setJobs(jobs); // This line is removed as per the edit hint
    });
    apiService
      .fetchSmartAlerts()
      .then((data) => {
        const mapped: ConflictAlert[] = data.map((alert, idx) => {
          const present = Number(alert.materialPresent ?? 0);
          const required = Number(alert.materialRequired ?? 0);
          const jobIdStr = String(alert.job ?? "");
          const jobName = jobNameById.get(jobIdStr);
          const itemName = alert.stockDescription ?? alert.stockCode ?? jobName ?? "Unknown";
          const jobLabel = jobIdStr || "Unknown";
          return {
            id: `${alert.job}-${idx}`,
            type: "material" as const,
            severity: present < 30 ? "critical" : "warning",
            title: `${itemName} Material Alert`,
            description: `${itemName} - Present: ${Number.isFinite(present) ? present : "N/A"}, Required: ${Number.isFinite(required) ? required : "N/A"}`,
            jobId: String(jobLabel),
            suggestion: "Review material availability before scheduling",
            autoResolvable: false,
          };
        });
        setBackendAlerts(mapped);
      })
      .catch((err) => console.error("❌ Error loading smart alerts:", err))
      .finally(() => setLoadingAlerts(false));
  }, []);

  // Fetch ERP data
  useEffect(() => {
    if (!envConfig?.api?.baseUrl) {
      console.log("Environment config not available yet, skipping ERP data fetch");
      return;
    }

    const fetchERPData = async () => {
      setErpLoading(true);
      setErpError(null);
      try {
        // Fetch inventory data
        let inventoryData;
        try {
          inventoryData = await apiService.fetchInventoryData();
        } catch (inventoryError) {
          console.warn("⚠️ Inventory API failed, using empty data:", inventoryError);
          inventoryData = [];
        }
        
        const mappedMaterials: MaterialData[] = Array.isArray(inventoryData)
          ? inventoryData.map((item: any) => ({
              id: item.stockCode,
              name: item.productName || item.stockCode,
              currentStock: item.quantityOnHand ?? 0,
              requiredStock: item.quantityRequired ?? 0,
              unit: "pcs",
              status: (() => {
                const available = item.quantityOnHand ?? 0;
                const required = item.quantityRequired ?? 0;
                if (available === 0) return "unavailable";
                if (required > 0) {
                  if (available < required * 0.2) return "critical";
                  if (available < required * 0.5) return "low";
                }
                return "available";
              })() as "available" | "low" | "critical" | "unavailable",
              cost: item.totalPrice ?? 0,
              source: item.source ?? "",
            }))
          : [];
        setMaterialData(mappedMaterials);

        // Fetch job readiness data
        const baseUrl = envConfig.api.baseUrl;
        const jobReadinessUrl = `${baseUrl}/api/erpintegration/job-material-readiness`;
        
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(jobReadinessUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const rawData = await response.json();

          const mappedJobs: JobReadiness[] = rawData.map((item: any) => ({
            jobId: item.job,
            name: item.jobDescription || item.stockDescription || item.job,
            materialStatus: (() => {
              const status = (item.materialStatus || "").toLowerCase();
              if (status.includes("missing")) return "missing";
              if (status.includes("partial")) return "partial";
              if (status.includes("delayed")) return "delayed";
              return "ready";
            })() as JobReadiness["materialStatus"],
            personnelStatus: "ready",
            issues: {
              material: item.missingMaterials
                ? item.missingMaterials.split(",").map((m: string) => m.trim())
                : [],
              personnel: [],
            },
          }));
          mappedJobs.sort((a, b) => a.jobId.localeCompare(b.jobId));
          setJobReadinessData(mappedJobs);
          
        } else {
          const errorText = await response.text();
          console.error("❌ Job readiness API error:", response.status, errorText);
          throw new Error(`Job readiness API failed: ${response.status} - ${errorText}`);
        }

        setLastErpSync(new Date());
      } catch (err: any) {
        let errorMessage = "Failed to fetch ERP data";
        
        if (err.name === 'AbortError') {
          errorMessage = "Request timeout - please check your connection";
        } else if (err.message) {
          errorMessage = err.message;
        }
        console.error("❌ Error details:", {
          name: err.name,
          message: err.message,
          stack: err.stack,
          cause: err.cause
        });
        setErpError(errorMessage);
      } finally {
        setErpLoading(false);
      }
    };

    fetchERPData();
  }, [envConfig?.api?.baseUrl, retryCount]);

  useEffect(() => {
    if (searchTerm === "") {
      setSearchedJobs([]);
      setSearchedAlerts([]);
      return;
    }
    setSearchLoading(true);
    const handler = setTimeout(() => {
      Promise.all([
        apiService.fetchSchedulingData(),
        apiService.fetchSmartAlerts()
      ]).then(([{ jobs }, alertsData]) => {
        // Filter jobs by search term
        const filteredJobs = jobs.filter(job =>
          job.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchedJobs(filteredJobs);
        // Map alerts as before
        const mappedAlerts: ConflictAlert[] = alertsData.map((alert, idx) => {
          const present = Number(alert.materialPresent ?? 0);
          const required = Number(alert.materialRequired ?? 0);
          const jobIdStr = String(alert.job ?? "");
          const jobName = jobNameById.get(jobIdStr);
          const itemName = alert.stockDescription ?? alert.stockCode ?? jobName ?? "Unknown";
          const jobLabel = jobIdStr || "Unknown";
          return {
            id: `${alert.job}-${idx}`,
            type: "material" as const,
            severity: present < 30 ? "critical" : "warning",
            title: `${itemName} Material Alert`,
            description: `${itemName} - Present: ${Number.isFinite(present) ? present : "N/A"}, Required: ${Number.isFinite(required) ? required : "N/A"}`,
            jobId: String(jobLabel),
            suggestion: "Review material availability before scheduling",
            autoResolvable: false,
          };
        });
        // Only show alerts for jobs that match the search
        const filteredAlerts = mappedAlerts.filter(alert =>
          filteredJobs.some(job => job.id === alert.jobId)
        );
        setSearchedAlerts(filteredAlerts);
        setSearchLoading(false);
      }).catch(() => setSearchLoading(false));
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);



  // Map backend alerts → ConflictAlert
  // const mappedBackendAlerts: ConflictAlert[] = backendAlerts.map(
  //   (alert, idx) => ({
  //     job: alert.job,  // Now this will work
  //     type: "material",
  //     severity: alert.impactScore > 70 ? "critical" : "warning",
  //     title: `Job ${alert.stockCode} Material Alert`,
  //     description: `${alert.stockDescription} - Present: ${alert.materialPresent}, Required: ${alert.materialRequired}`,
  //     jobId: String(alert.job),
  //     suggestion: "Review material availability before scheduling",
  //     autoResolvable: false,
  //   })
  // );
  const combinedAlerts = backendAlerts;

  // Apply filter
  const filteredAlerts = combinedAlerts.filter(
    (alert) =>
      (alertFilter === "all" || alert.severity === alertFilter) &&
      (
        searchTerm === ""
          ? true
          : searchedJobs.some(job => job.id === alert.jobId)
      )
  );

  const alertsToShow = searchTerm ? searchedAlerts : filteredAlerts;

  // Get ERP alerts from real data
  const erpAlerts = materialData
    .filter((material) => material.status === "critical" || material.status === "low")
    .map((material) => `Low stock alert: ${material.name} (${material.currentStock}/${material.requiredStock})`);



  const handleFilterToggle = (
    category: keyof typeof selectedFilters,
    value: string
  ) => {
    const newFilters = {
      ...selectedFilters,
      [category]: selectedFilters[category].includes(value)
        ? selectedFilters[category].filter((item) => item !== value)
        : [...selectedFilters[category], value],
    };
    setSelectedFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const getStockStatus = (level: number) => {
    if (level >= 70) return "bg-green-500";
    if (level >= 30) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getAlertIcon = (type: ConflictAlert["type"]) => {
    switch (type) {
      case "overbooked":
        return <Clock className="w-4 h-4" />;
      case "overlap":
        return <AlertTriangle className="w-4 h-4" />;
      case "material":
        return <Package className="w-4 h-4" />;
      case "resource":
        return <Users className="w-4 h-4" />;
    }
  };

  const handleAutoResolve = (alert: ConflictAlert) => {
    toast.success(`Auto-resolving ${alert.title}`, {
      description: alert.suggestion,
    });
    setDismissedAlerts((prev) => new Set(prev).add(alert.id));
  };

  const handleDismissAlert = (alertId: string) => {
    setDismissedAlerts((prev) => new Set(prev).add(alertId));
  };

  // ERP helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "text-green-600 bg-green-50";
      case "low":
        return "text-yellow-600 bg-yellow-50";
      case "critical":
        return "text-red-600 bg-red-50";
      case "unavailable":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "low":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case "critical":
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case "unavailable":
        return <X className="w-4 h-4 text-gray-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getMaterialIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("bicycle") || lowerName.includes("bike"))
      return <Activity className="w-4 h-4" />;
    if (lowerName.includes("bench")) return <Target className="w-4 h-4" />;
    if (lowerName.includes("architecture") || lowerName.includes("land"))
      return <BarChart3 className="w-4 h-4" />;
    return <Package className="w-4 h-4" />;
  };

  const getJobIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("bicycle") || lowerName.includes("bike"))
      return <Activity className="w-4 h-4" />;
    if (lowerName.includes("bench")) return <Target className="w-4 h-4" />;
    if (lowerName.includes("assembly")) return <Settings className="w-4 h-4" />;
    if (lowerName.includes("production")) return <Zap className="w-4 h-4" />;
    return <Calendar className="w-4 h-4" />;
  };

  const refreshERPData = async () => {
    setErpLoading(true);
    try {
      // Re-fetch ERP data
      const inventoryData = await apiService.fetchInventoryData();
      const mappedMaterials: MaterialData[] = Array.isArray(inventoryData)
        ? inventoryData.map((item: any) => ({
            id: item.stockCode,
            name: item.productName || item.stockCode,
            currentStock: item.quantityOnHand ?? 0,
            requiredStock: item.quantityRequired ?? 0,
            unit: "pcs",
            status: (() => {
              const available = item.quantityOnHand ?? 0;
              const required = item.quantityRequired ?? 0;
              if (available === 0) return "unavailable";
              if (required > 0) {
                if (available < required * 0.2) return "critical";
                if (available < required * 0.5) return "low";
              }
              return "available";
            })() as "available" | "low" | "critical" | "unavailable",
            cost: item.totalPrice ?? 0,
            source: item.source ?? "",
          }))
        : [];
      setMaterialData(mappedMaterials);
      setLastErpSync(new Date());
      toast.success("ERP data refreshed successfully");
    } catch (err: any) {
      toast.error("Failed to refresh ERP data");
      console.error("ERP refresh error:", err);
    } finally {
      setErpLoading(false);
    }
  };

  // Calculate ERP statistics
  const materialStats = {
    total: materialData.length,
    available: materialData.filter((m) => m.status === "available").length,
    low: materialData.filter((m) => m.status === "low").length,
    critical: materialData.filter((m) => m.status === "critical").length,
    unavailable: materialData.filter((m) => m.status === "unavailable").length,
  };

  const jobStats = {
    total: jobReadinessData.length,
    ready: jobReadinessData.filter((j) => j.materialStatus === "ready").length,
    missing: jobReadinessData.filter((j) => j.materialStatus === "missing").length,
    partial: jobReadinessData.filter((j) => j.materialStatus === "partial" || j.materialStatus === "delayed").length,
  };

  if (isCollapsed) {
    return (
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggle}
          className="glass-panel shadow-medium hover:shadow-strong transition-all duration-300"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-full bg-background/95 backdrop-blur-md border-l border-border shadow-strong z-30 animate-slide-in-right">
      <div className="w-96 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Control Panel
          </h2>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid w-full grid-cols-3 m-2">
            <TabsTrigger value="alerts" className="text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Alerts
              {filteredAlerts.length + erpAlerts.length > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-1 h-4 min-w-4 text-xs"
                >
                  {filteredAlerts.length + erpAlerts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="erp" className="text-xs">
              <Package className="w-3 h-3 mr-1" />
              ERP
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full w-full">
              <TabsContent value="alerts" className="p-4 space-y-4">
                {/* Smart Alerts */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Smart Alerts ({alertsToShow.length})
                    </h3>
                    <div className="flex gap-1">
                      {["all", "critical", "warning"].map((filterType) => (
                        <Button
                          key={filterType}
                          variant={
                            alertFilter === filterType ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            setAlertFilter(filterType as typeof alertFilter)
                          }
                          className="text-xs h-6"
                        >
                          {filterType.charAt(0).toUpperCase() +
                            filterType.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Input
                    type="text"
                    placeholder="Search job name..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="mb-2"
                  />
                  {searchLoading && <div className="text-xs text-muted-foreground mb-2">Searching...</div>}

                  {alertsToShow.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-500" />
                      <p className="text-sm">No smart alerts</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {alertsToShow.map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-3 rounded-lg border ${
                            alert.severity === "critical"
                              ? "bg-destructive/5 border-destructive/20"
                              : "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getAlertIcon(alert.type)}
                              <Badge
                                variant={
                                  alert.severity === "critical"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {alert.severity.toUpperCase()}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDismissAlert(alert.id)}
                              className="p-1 h-auto"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>

                          <h4 className="font-medium text-sm mb-1">
                            {alert.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            {alert.description}
                          </p>

                          <div className="bg-background/50 p-2 rounded text-xs mb-2">
                            <span className="font-medium">Suggestion:</span>{" "}
                            {alert.suggestion}
                          </div>

                          <div className="flex gap-2">
                            {alert.autoResolvable && (
                              <Button
                                size="sm"
                                onClick={() => handleAutoResolve(alert)}
                                className="text-xs h-6"
                              >
                                Auto Resolve
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-6"
                            >
                              View Job
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* ERP Alerts */}
                {erpAlerts.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-amber-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      ERP Alerts ({erpAlerts.length})
                    </h3>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      {erpAlerts.map((alert, idx) => (
                        <div key={idx} className="text-xs text-amber-700">
                          • {alert}
                        </div>
                      ))}
                    </div>
                  </div>
                )}


              </TabsContent>

              <TabsContent value="erp" className="p-4 space-y-4">
                {/* ERP Header with Refresh */}
                <div className="flex flex-col h-full">
                  {/* Material Statistics */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="p-2 bg-green-50 rounded-lg text-center">
                      <div className="text-lg font-bold text-green-600">{materialStats.available}</div>
                      <div className="text-xs text-green-600">Available</div>
                    </div>
                    <div className="p-2 bg-red-50 rounded-lg text-center">
                      <div className="text-lg font-bold text-red-600">{materialStats.critical}</div>
                      <div className="text-xs text-red-600">Critical</div>
                    </div>
                  </div>

                  {/* Material Inventory */}
                  <div className="space-y-3 mb-4">
                    <h3 className="font-medium text-sm flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Material Inventory ({materialData.length})
                    </h3>
                    {erpLoading ? (
                      <div className="text-center py-4 text-muted-foreground">
                        <RefreshCw className="w-4 h-4 mx-auto mb-2 animate-spin" />
                        <p className="text-xs">Loading materials...</p>
                      </div>
                    ) : materialData.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        <Package className="w-4 h-4 mx-auto mb-2" />
                        <p className="text-xs">No materials found</p>
                      </div>
                    ) : (
                      <div className="h-[200px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/30">
                        <div className="space-y-2">
                          {materialData.slice(0, 5).map((material, idx) => (
                            <div
                              key={material.id || idx}
                              className="p-2 bg-muted/30 rounded-lg border"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  {getMaterialIcon(material.name)}
                                  <span className="text-xs font-medium truncate max-w-24">
                                    {material.name}
                                  </span>
                                </div>
                                <Badge className={`${getStatusColor(material.status)} text-xs`}>
                                  {material.status.toUpperCase()}
                                </Badge>
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>{material.currentStock} / {material.requiredStock}</span>
                                <span>{material.requiredStock > 0 ? ((material.currentStock / material.requiredStock) * 100).toFixed(0) : 0}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1">
                                <div
                                  className={`h-1 rounded-full ${
                                    material.status === 'available' ? 'bg-green-500' :
                                    material.status === 'low' ? 'bg-yellow-500' :
                                    material.status === 'critical' ? 'bg-red-500' : 'bg-gray-500'
                                  }`}
                                  style={{ 
                                    width: `${material.requiredStock > 0 ? Math.min((material.currentStock / material.requiredStock) * 100, 100) : 0}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator className="my-4" />

                  {/* Job Readiness - Takes remaining space */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Job Readiness ({jobReadinessData.length})
                      </h3>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {jobStats.ready} Ready
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {jobStats.missing + jobStats.partial} Issues
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-h-0">
                      {erpLoading ? (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          <span className="text-sm">Loading jobs...</span>
                        </div>
                      ) : jobReadinessData.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
                          <Calendar className="w-6 h-6 mb-2" />
                          <p className="text-sm">No jobs to display</p>
                          <p className="text-xs mt-1">Jobs will appear here once loaded</p>
                        </div>
                      ) : (
                        <div className="h-full overflow-y-auto pr-2 -mr-2">
                          <div className="space-y-2 pr-1">
                            {jobReadinessData.map((job, idx) => (
                              <div
                                key={job.jobId || idx}
                                className="p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium text-sm">{job.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {job.jobId}
                                    </div>
                                  </div>
                                  <Badge 
                                    variant={job.materialStatus === 'ready' ? 'default' : 'destructive'}
                                    className="text-xs"
                                  >
                                    {job.materialStatus.toUpperCase()}
                                  </Badge>
                                </div>
                                
                                {job.issues?.material && job.issues.material.length > 0 && (
                                  <div className="mt-2 text-xs text-red-600">
                                    <div className="font-medium">Missing Materials:</div>
                                    <ul className="list-disc list-inside">
                                      {job.issues.material.slice(0, 2).map((mat, i) => (
                                        <li key={i} className="truncate">{mat}</li>
                                      ))}
                                      {job.issues.material.length > 2 && (
                                        <li>+{job.issues.material.length - 2} more</li>
                                      )}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="config" className="p-4 space-y-4 m-0">
                {/* Configuration Controls */}
                {config && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-sm">
                      Schedule Configuration
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Time Horizon</span>
                        <span className="text-sm font-medium">
                          {config.timeHorizon} days
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={onApplyConfig}
                          size="sm"
                          className="flex-1"
                        >
                          Apply
                        </Button>
                        <Button
                          onClick={onResetConfig}
                          size="sm"
                          variant="outline"
                          className="flex-1"
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
