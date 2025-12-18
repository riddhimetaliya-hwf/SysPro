import React, { useState, useEffect } from "react";
import { AppSidebar } from "@/components/Layout/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/UI/sidebar";
import { ResponsiveContainer } from "@/components/Layout/ResponsiveContainer";
import { BreadcrumbNav } from "@/components/Navigation/BreadcrumbNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/UI/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Badge } from "@/components/UI/badge";
import { Progress } from "@/components/UI/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/UI/alert";
import { Input } from "@/components/ui/input";
import {
  Package,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Search,
  BarChart3,
  Zap,
  ShoppingCart,
  Target,
  Activity,
  Calendar,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/api";
import { config } from "@/config/environment";

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

// Fetch inventory data from ERP
async function fetchInventoryData(
  setMaterialData: (data: MaterialData[]) => void,
  setLastSync: (lastSync: Date) => void,
  setError: (error: string | null) => void,
  setIsRefreshing: (isRefreshing: boolean) => void
) {
  try {
    const response = await fetch(
      `${config.api.baseUrl}/api/erpintegration/inventory`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const rawData = await response.json();

    // Map backend fields to MaterialData type
    const mappedMaterials: MaterialData[] = rawData.map((item: any) => ({
      id: item.stockCode,
      name: item.productName || item.stockCode,
      currentStock: item.quantityOnHand ?? 0,
      requiredStock: item.quantityRequired ?? 0,
      unit: "pcs",
      status: (() => {
        const available = item.quantityOnHand ?? 0;
        const required = item.quantityRequired ?? 0;
        
        if (available === 0 && required === 0) return "unavailable";
        if (available === 0 && required > 0) return "critical";
        if (required === 0) return "available";
        if (available < 100) return "critical";
        
        const daysOfStock = (available / required) * 30;
        if (daysOfStock < 7) {
          return "critical";
        } else if (available < required) {
          return "low";
        }
        return "available";
      })() as "available" | "low" | "critical" | "unavailable",
      cost: item.totalPrice ?? 0,
      source: item.source ?? "",
    }));

    setMaterialData(mappedMaterials);
    setLastSync(new Date());
    setError(null);
  } catch (err: any) {
    setError(err.message || "Failed to fetch inventory data");
  } finally {
    setIsRefreshing(false);
  }
}

// Fetch job readiness data from ERP
async function fetchJobReadiness(
  setJobs: (jobs: JobReadiness[]) => void,
  setLastSync: (lastSync: Date) => void,
  setError: (error: string | null) => void,
  setIsRefreshing: (isRefreshing: boolean) => void
) {
  try {
    const response = await fetch(
      `${config.api.baseUrl}/api/erpintegration/job-material-readiness`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

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

    setJobs(mappedJobs);
    setLastSync(new Date());
    setError(null);
  } catch (err: any) {
    setError(err.message || "Failed to fetch job readiness data");
  } finally {
    setIsRefreshing(false);
  }
}

const ERPIntegration = () => {
  const [jobs, setJobs] = useState<JobReadiness[]>([]);
  const [materialData, setMaterialData] = useState<MaterialData[]>([]);
  const [lastSync, setLastSync] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Inventory-specific state
  const [materialSearchTerm, setMaterialSearchTerm] = useState("");
  const [materialStatusFilter, setMaterialStatusFilter] = useState("all");
  const [materialSortBy, setMaterialSortBy] = useState("name");
  
  // Job-specific state
  const [jobSearchTerm, setJobSearchTerm] = useState("");
  const [jobStatusFilter, setJobStatusFilter] = useState("all");
  const [jobSortBy, setJobSortBy] = useState("name");

  // Fetch all data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      setIsRefreshing(true);
      await Promise.all([
        fetchInventoryData(setMaterialData, setLastSync, setError, setIsRefreshing),
        fetchJobReadiness(setJobs, setLastSync, setError, setIsRefreshing)
      ]);
    };
    
    fetchAllData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchInventoryData(setMaterialData, setLastSync, setError, setIsRefreshing),
        fetchJobReadiness(setJobs, setLastSync, setError, setIsRefreshing)
      ]);
      toast.success("ERP data refreshed successfully");
    } catch (err) {
      toast.error("Failed to refresh data");
    }
  };

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
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "unavailable":
        return <XCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const criticalMaterials = materialData.filter(
    (m) => m.status === "critical" || m.status === "low"
  );

  // Enhanced material filtering and sorting
const filteredMaterials = materialData
  .filter((material) => {
    const matchesSearch = material.name
      .toLowerCase()
      .includes(materialSearchTerm.toLowerCase());
    const matchesStatus =
      materialStatusFilter === "all" ||
      (materialStatusFilter === "critical" 
        ? material.status === "critical" || material.status === "low"
        : material.status === materialStatusFilter);
    return matchesSearch && matchesStatus;
  })
  .sort((a, b) => {
    // ✅ Move statusOrder outside the switch
    const statusOrder = { critical: 0, low: 1, unavailable: 2, available: 3 };
    
    switch (materialSortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "stock":
        return b.currentStock - a.currentStock;
      case "status":
        return statusOrder[a.status] - statusOrder[b.status];
      case "cost":
        return b.cost - a.cost;
      default:
        return 0;
    }
  });

  // Calculate material statistics
  const materialStats = {
    total: materialData.length,
    available: materialData.filter((m) => m.status === "available").length,
    low: materialData.filter((m) => m.status === "low").length,
    critical: materialData.filter((m) => m.status === "critical").length,
    unavailable: materialData.filter((m) => m.status === "unavailable").length,
  };

  // Get dynamic icon based on material name
  const getMaterialIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("bicycle") || lowerName.includes("bike"))
      return <Activity className="w-4 h-4" />;
    if (lowerName.includes("bench")) return <Target className="w-4 h-4" />;
    if (lowerName.includes("architecture") || lowerName.includes("land"))
      return <BarChart3 className="w-4 h-4" />;
    return <Package className="w-4 h-4" />;
  };

  // Enhanced job filtering and sorting
const filteredJobs = jobs
  .filter((job) => {
    const matchesSearch = job.name
      .toLowerCase()
      .includes(jobSearchTerm.toLowerCase()) ||
      job.jobId.toLowerCase().includes(jobSearchTerm.toLowerCase());
    
    // Extract the status check logic
    const hasMatIssue = job.materialStatus !== "ready";
    let matchesStatus = true;
    
    if (jobStatusFilter !== "all") {
      switch (jobStatusFilter) {
        case "ready":
          matchesStatus = !hasMatIssue;
          break;
        case "missing":
          matchesStatus = hasMatIssue;
          break;
        case "partial":
          matchesStatus = job.materialStatus === "partial";
          break;
        case "delayed":
          matchesStatus = job.materialStatus === "delayed";
          break;
        default:
          matchesStatus = true;
      }
    }
    
    return matchesSearch && matchesStatus;
  })
  .sort((a, b) => {
    const getStatusPriority = (job: JobReadiness) => {
      const hasMatIssue = job.materialStatus !== "ready";
      if (hasMatIssue) return 0;
      return 1;
    };
    
    switch (jobSortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "jobId":
        return a.jobId.localeCompare(b.jobId);
      case "status":
        return getStatusPriority(a) - getStatusPriority(b);
      default:
        return 0;
    }
  });

  // Calculate job statistics
  const jobStats = {
    total: jobs.length,
    ready: jobs.filter((j) => j.materialStatus === "ready").length,
    missing: jobs.filter((j) => j.materialStatus === "missing").length,
    partial: jobs.filter((j) => j.materialStatus === "partial" || j.materialStatus === "delayed").length,
    personnel: jobs.filter((j) => j.personnelStatus !== "ready").length,
  };

  // Get dynamic job icon based on job name
  const getJobIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("bicycle") || lowerName.includes("bike"))
      return <Activity className="w-4 h-4" />;
    if (lowerName.includes("bench")) return <Target className="w-4 h-4" />;
    if (lowerName.includes("assembly")) return <Settings className="w-4 h-4" />;
    if (lowerName.includes("production")) return <Zap className="w-4 h-4" />;
    return <Calendar className="w-4 h-4" />;
  };

  return (
    <SidebarProvider>
      <ResponsiveContainer className="min-h-screen flex w-full">
        <AppSidebar />

        <SidebarInset className="flex flex-col flex-1">
          <BreadcrumbNav />

          <div className="flex-1 p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">ERP Integration</h1>
                <p className="text-muted-foreground">
                  Live inventory and job readiness management
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Last sync: {lastSync.toLocaleTimeString()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${
                      isRefreshing ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>

            {/* Alerts */}
            {criticalMaterials.length > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {criticalMaterials.length} materials are running low or
                  critically short. Jobs may be impacted.
                </AlertDescription>
              </Alert>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Main Content */}
            <Tabs defaultValue="inventory" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="inventory"
                  className="flex items-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  Inventory
                </TabsTrigger>
                <TabsTrigger value="jobs" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Job Readiness
                </TabsTrigger>
              </TabsList>

              <TabsContent value="inventory" className="space-y-6">
                {/* Material Statistics Dashboard */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg border-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-600 opacity-90"></div>
                    <CardContent className="relative p-4 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-100 text-sm font-medium">
                            Available Materials
                          </p>
                          <p className="text-2xl font-bold">{materialStats.available}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                          <CheckCircle className="w-6 h-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg border-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 opacity-90"></div>
                    <CardContent className="relative p-4 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-amber-100 text-sm font-medium">
                            Low Stock
                          </p>
                          <p className="text-2xl font-bold">{materialStats.low}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                          <AlertTriangle className="w-6 h-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg border-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 opacity-90"></div>
                    <CardContent className="relative p-4 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-red-100 text-sm font-medium">
                            Critical Stock
                          </p>
                          <p className="text-2xl font-bold">{materialStats.critical}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                          <XCircle className="w-6 h-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg border-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-500 to-slate-600 opacity-90"></div>
                    <CardContent className="relative p-4 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-100 text-sm font-medium">
                            Total Materials
                          </p>
                          <p className="text-2xl font-bold">{materialStats.total}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                          <Package className="w-6 h-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Search and Filtering Controls */}
                <Card className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search materials..."
                        value={materialSearchTerm}
                        onChange={(e) => setMaterialSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <select
                        value={materialStatusFilter}
                        onChange={(e) => setMaterialStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                      >
                        <option value="all">All Status</option>
                        <option value="available">Available</option>
                        <option value="low">Low Stock</option>
                        <option value="critical">Critical</option>
                        <option value="unavailable">Unavailable</option>
                      </select>
                      
                      <select
                        value={materialSortBy}
                        onChange={(e) => setMaterialSortBy(e.target.value)}
                        className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                      >
                        <option value="name">Sort by Name</option>
                        <option value="stock">Sort by Stock</option>
                        <option value="status">Sort by Status</option>
                        <option value="cost">Sort by Cost</option>
                      </select>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                      >
                        {isRefreshing ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Materials Grid */}
                {filteredMaterials.length === 0 ? (
                  <Card className="p-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-muted rounded-full">
                        <Package className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">No materials found</h3>
                        <p className="text-muted-foreground">
                          {materialSearchTerm || materialStatusFilter !== "all"
                            ? "Try adjusting your search or filter criteria"
                            : "No materials are currently available in the system"}
                        </p>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMaterials.map((material, idx) => {
                      const stockPercentage = material.requiredStock > 0 
                        ? (material.currentStock / material.requiredStock) * 100 
                        : 0;
                      
                      const getCardGradient = (status: string) => {
                        switch (status) {
                          case "available":
                            return "from-emerald-500/10 to-green-500/10";
                          case "low":
                            return "from-amber-500/10 to-orange-500/10";
                          case "critical":
                            return "from-red-500/10 to-pink-500/10";
                          default:
                            return "from-slate-500/10 to-gray-500/10";
                        }
                      };
                      
                      const getStatusStripe = (status: string) => {
                        switch (status) {
                          case "available":
                            return "bg-emerald-500";
                          case "low":
                            return "bg-amber-500";
                          case "critical":
                            return "bg-red-500";
                          default:
                            return "bg-gray-400";
                        }
                      };

                      return (
                        <Card 
                          key={material.id || idx}
                          className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 bg-card"
                        >
                          <div className={`absolute top-0 left-0 right-0 h-1 ${getStatusStripe(material.status)}`}></div>
                          <div className={`absolute inset-0 bg-gradient-to-br ${getCardGradient(material.status)} opacity-40`}></div>
                          <div className="absolute inset-0 backdrop-blur-[1px] bg-white/40 dark:bg-slate-950/40"></div>
                          
                          <CardContent className="relative p-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-background/50 rounded-lg backdrop-blur-sm">
                                  {getMaterialIcon(material.name)}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-foreground/90 group-hover:text-foreground transition-colors">
                                    {material.name}
                                  </h3>
                                  <p className="text-xs text-muted-foreground">ID: {material.id}</p>
                                </div>
                              </div>
                              
                              <Badge className={`${getStatusColor(material.status)} shadow-sm`}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(material.status)}
                                  {material.status.toUpperCase()}
                                </div>
                              </Badge>
                            </div>
                            
                            {/* Stock Level Progress */}
                            <div className="space-y-1">
                              <h4 className="text-sm font-medium text-foreground">
                                Current Stock / Required Stock
                              </h4>
                              <div className="flex items-baseline justify-between">
                                <div className="flex items-baseline space-x-2">
                                  <span className="text-3xl font-bold">{material.currentStock}</span>
                                  <span className="text-muted-foreground">/</span>
                                  <span className="text-lg text-muted-foreground">{material.requiredStock}</span>
                                </div>
                                <span className="text-sm text-muted-foreground">{material.unit}</span>
                              </div>
                              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={`absolute left-0 top-0 h-full transition-all duration-500 rounded-full ${
                                    stockPercentage >= 80 ? 'bg-emerald-500' :
                                    stockPercentage >= 50 ? 'bg-amber-500' :
                                    stockPercentage >= 20 ? 'bg-orange-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            {/* Material Details */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="space-y-1">
                                <span className="text-muted-foreground">Source</span>
                                <p className="font-medium flex items-center gap-1">
                                  <ShoppingCart className="w-3 h-3" />
                                  {material.source || "N/A"}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-muted-foreground">Cost</span>
                                <p className="font-medium flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  ${material.cost.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            
                            {/* Status-specific alerts */}
                            {material.status === "critical" && (
                              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                                  <AlertTriangle className="w-4 h-4" />
                                  <span className="font-medium">Critical shortage - immediate action required</span>
                                </div>
                              </div>
                            )}
                            
                            {material.status === "low" && (
                              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                                  <AlertTriangle className="w-4 h-4" />
                                  <span className="font-medium">Low stock - consider reordering</span>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="jobs" className="space-y-6">
                {/* Job Statistics Dashboard */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg border-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-600 opacity-90"></div>
                    <CardContent className="relative p-4 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-100 text-sm font-medium">
                            Ready Jobs
                          </p>
                          <p className="text-2xl font-bold">{jobStats.ready}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                          <CheckCircle className="w-6 h-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg border-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 opacity-90"></div>
                    <CardContent className="relative p-4 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-red-100 text-sm font-medium">
                            Missing Materials
                          </p>
                          <p className="text-2xl font-bold">{jobStats.missing}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                          <XCircle className="w-6 h-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg border-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 opacity-90"></div>
                    <CardContent className="relative p-4 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-amber-100 text-sm font-medium">
                            Partial/Delayed
                          </p>
                          <p className="text-2xl font-bold">{jobStats.partial}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                          <Clock className="w-6 h-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg border-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-500 to-slate-600 opacity-90"></div>
                    <CardContent className="relative p-4 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-100 text-sm font-medium">
                            Total Jobs
                          </p>
                          <p className="text-2xl font-bold">{jobStats.total}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                          <Calendar className="w-6 h-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Search and Filtering Controls */}
                <Card className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search jobs by name or ID..."
                        value={jobSearchTerm}
                        onChange={(e) => setJobSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <select
                        value={jobStatusFilter}
                        onChange={(e) => setJobStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                      >
                        <option value="all">All Status</option>
                        <option value="ready">Ready</option>
                        <option value="missing">Missing Materials</option>
                        <option value="partial">Partial Materials</option>
                        <option value="delayed">Delayed</option>
                      </select>
                      
                      <select
                        value={jobSortBy}
                        onChange={(e) => setJobSortBy(e.target.value)}
                        className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                      >
                        <option value="name">Sort by Name</option>
                        <option value="jobId">Sort by Job ID</option>
                        <option value="status">Sort by Status</option>
                      </select>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                      >
                        {isRefreshing ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Jobs Grid */}
                {filteredJobs.length === 0 ? (
                  <Card className="p-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-muted rounded-full">
                        <Calendar className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                        <p className="text-muted-foreground">
                          {jobSearchTerm || jobStatusFilter !== "all"
                            ? "Try adjusting your search or filter criteria"
                            : "No jobs are currently available in the system"}
                        </p>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredJobs.map((job, idx) => {
                      const hasMatIssue = job.materialStatus !== "ready";
                      
                      const getJobCardGradient = () => {
                        if (hasMatIssue) return "from-red-500/10 to-pink-500/10";
                        return "from-emerald-500/10 to-green-500/10";
                      };
                      
                      const getJobStatusStripe = () => {
                        if (hasMatIssue) return "bg-red-500";
                        return "bg-emerald-500";
                      };

                      return (
                        <Card 
                          key={job.jobId || idx}
                          className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 bg-card"
                        >
                          {/* Top Status Stripe */}
                          <div className={`absolute top-0 left-0 right-0 h-1 ${getJobStatusStripe()}`}></div>
                          
                          {/* Background Gradient */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${getJobCardGradient()} opacity-40`}></div>
                          
                          {/* Backdrop Blur Panel */}
                          <div className="absolute inset-0 backdrop-blur-[1px] bg-white/40 dark:bg-slate-950/40"></div>
                          
                          <CardContent className="relative p-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-background/50 rounded-lg backdrop-blur-sm">
                                  {getJobIcon(job.name)}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-foreground/90 group-hover:text-foreground transition-colors">
                                    {job.name}
                                  </h3>
                                  <p className="text-xs text-muted-foreground">ID: {job.jobId}</p>
                                </div>
                              </div>
                              
                              <div className="flex flex-col gap-1">
                                {hasMatIssue && (
                                  <Badge className="text-red-600 bg-red-50 shadow-sm flex items-center gap-1 text-xs">
                                    <Package className="w-3 h-3" />
                                    {job.materialStatus === "missing" && "MISSING"}
                                    {job.materialStatus === "partial" && "PARTIAL"}
                                    {job.materialStatus === "delayed" && "DELAYED"}
                                  </Badge>
                                )}
                                {!hasMatIssue && (
                                  <Badge className="text-green-600 bg-green-50 shadow-sm flex items-center gap-1 text-xs">
                                    <CheckCircle className="w-3 h-3" />
                                    READY
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            {/* Job Issues Details */}
                            {job.issues?.material?.length > 0 && (
                              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 space-y-2">
                                <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300 font-medium">
                                  <Package className="w-4 h-4" />
                                  <span>Missing Materials:</span>
                                </div>
                                <ul className="space-y-1 text-sm text-red-600 dark:text-red-400 ml-6">
                                  {job.issues.material.map((item, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                      <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Ready Job Status */}
                            {!hasMatIssue && (
                              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300 font-medium">
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Job is ready to proceed - all materials available</span>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </SidebarInset>
      </ResponsiveContainer>
    </SidebarProvider>
  );
};

export default ERPIntegration;