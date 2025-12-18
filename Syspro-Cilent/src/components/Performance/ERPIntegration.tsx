import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Badge } from "@/components/UI/badge";
import { Progress } from "@/components/UI/progress";
import { Button } from "@/components/UI/button";
import { Alert, AlertDescription } from "@/components/UI/alert";
import { Job, Material } from "@/types/jobs";
import {
  Package,
  ShoppingCart,
  Users,
  AlertCircle,
  Clock,
  TrendingDown,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/api";

interface ERPData {
  materials: Material[];
  workOrders: {
    id: string;
    jobId: number;
    status: "pending" | "in-progress" | "completed" | "delayed";
    deadline: Date;
    priority: "low" | "medium" | "high" | "critical";
  }[];
  shiftAvailability: { shift: string; available: number; total: number }[];
}

interface MaterialImpact {
  material: Material;
  affectedJobs: Job[];
  recommendedAction: string;
  estimatedDelay: string;
}

interface ERPIntegrationProps {
  jobs: Job[];
  onJobUpdate: (job: Job) => void;
}

export const ERPIntegration = ({ jobs, onJobUpdate }: ERPIntegrationProps) => {
  console.log("ERPIntegration component mounted");
  const [erpData, setErpData] = useState<ERPData>({
    materials: [], // Will be loaded from API only
    workOrders: [
      {
        id: "WO-001",
        jobId: 1,
        status: "pending",
        deadline: new Date(Date.now() + 86400000),
        priority: "high",
      },
      {
        id: "WO-002",
        jobId: 2,
        status: "in-progress",
        deadline: new Date(Date.now() + 172800000),
        priority: "medium",
      },
      {
        id: "WO-003",
        jobId: 3,
        status: "delayed",
        deadline: new Date(Date.now() + 43200000),
        priority: "critical",
      },
    ],
    shiftAvailability: [
      { shift: "Morning", available: 8, total: 10 },
      { shift: "Afternoon", available: 6, total: 10 },
      { shift: "Night", available: 9, total: 10 },
    ],
  });
  const [materialImpacts, setMaterialImpacts] = useState<MaterialImpact[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [inventoryError, setInventoryError] = useState<string | null>(null);

  // Helper to map API inventory data to Material type
  function mapApiInventoryToMaterial(apiItem: any): Material {
    const required = apiItem.QuantityRequired ?? 0;
    const available = apiItem.QuantityOnHand ?? 0;
    let status: "available" | "low" | "critical" | "unavailable" = "available";
    if (available === 0) status = "unavailable";
    else if (required > 0) {
      if (available < required * 0.2) status = "critical";
      else if (available < required * 0.5) status = "low";
    }
    return {
      id: apiItem.StockCode,
      name: apiItem.ProductName || apiItem.StockCode,
      required,
      available,
      unit: "pcs", // Default
      status,
      cost: apiItem.TotalPrice ?? 0,
      eta: apiItem.ETA ?? "", // Optional if backend provides
      source: apiItem.Source ?? "", // Use 'source' instead of 'supplier'
    };
  }

  // Fetch inventory data from API on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await apiService.fetchInventoryData();
        console.log("Inventory API data:", data); // Debug: log the received data
        const materials = Array.isArray(data)
          ? data.map(mapApiInventoryToMaterial)
          : [];
        setErpData((prev) => ({ ...prev, materials }));
        setInventoryError(null);
      } catch (err: any) {
        setInventoryError(err.message || "Failed to fetch inventory data");
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Analyze material impacts on jobs
  const analyzeMaterialImpacts = () => {
    setIsAnalyzing(true);
    const impacts: MaterialImpact[] = [];

    erpData.materials.forEach((material) => {
      if (material.status === "critical" || material.status === "low") {
        const affected = jobs.filter((job) =>
          job.materials?.some((m) => m.id === material.id)
        );

        if (affected.length > 0) {
          impacts.push({
            material,
            affectedJobs: affected,
            recommendedAction:
              material.status === "critical"
                ? "Immediate procurement required"
                : "Schedule reorder within 48 hours",
            estimatedDelay:
              material.status === "critical" ? "2-3 days" : "1-2 days",
          });
        }
      }
    });

    setMaterialImpacts(impacts);
    setTimeout(() => setIsAnalyzing(false), 1000);
  };

  const handleRescheduleJobs = (impact: MaterialImpact) => {
    impact.affectedJobs.forEach((job) => {
      const updatedJob = {
        ...job,
        status: "OnHold" as const, // Use only allowed Job status
        conflictType: "material" as const,
        conflictDetails: {
          reason: `Material shortage: ${impact.material.name}`,
          recommendation: impact.recommendedAction,
        },
      };
      onJobUpdate(updatedJob);
    });

    toast.success("Jobs Rescheduled", {
      description: `${impact.affectedJobs.length} jobs rescheduled due to material shortage`,
    });
  };

  useEffect(() => {
    analyzeMaterialImpacts();
  }, [erpData, jobs]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500 text-green-50";
      case "low":
        return "bg-yellow-500 text-yellow-50";
      case "critical":
        return "bg-red-500 text-red-50";
      case "unavailable":
        return "bg-gray-500 text-gray-50";
      default:
        return "bg-gray-500 text-gray-50";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      {/* Material Impact Analysis */}
      {materialImpacts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="flex items-center justify-between">
              <span>
                {materialImpacts.length} material shortages affecting{" "}
                {materialImpacts.reduce(
                  (sum, impact) => sum + impact.affectedJobs.length,
                  0
                )}{" "}
                jobs
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={analyzeMaterialImpacts}
                disabled={isAnalyzing}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${
                    isAnalyzing ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Material Impact Details */}
      {materialImpacts.map((impact) => (
        <Card key={impact.material.id} className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-red-800">
                  Material Shortage: {impact.material.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  Available: {impact.material.available} / Required:{" "}
                  {impact.material.required} {impact.material.unit}
                </p>
              </div>
              <Badge className="bg-red-100 text-red-800">
                {impact.material.status.toUpperCase()}
              </Badge>
            </div>

            <div className="space-y-2 mb-3">
              <div className="text-sm">
                <span className="font-medium">Affected Jobs:</span>{" "}
                {impact.affectedJobs.map((job) => job.name).join(", ")}
              </div>
              <div className="text-sm">
                <span className="font-medium">Estimated Delay:</span>{" "}
                {impact.estimatedDelay}
              </div>
              <div className="text-sm">
                <span className="font-medium">ETA:</span>{" "}
                {impact.material.eta || "Not scheduled"}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRescheduleJobs(impact)}
              >
                Reschedule Jobs
              </Button>
              <Button size="sm" variant="default">
                Expedite Order
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Enhanced Material Inventory */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Package className="w-4 h-4" />
            Material Inventory & Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inventoryError && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {inventoryError}
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {erpData.materials.map((material) => (
              <div
                key={material.id}
                className="bg-white rounded-2xl shadow p-5 flex flex-col gap-2 border-t-4"
                style={{
                  borderTopColor:
                    material.status === "critical"
                      ? "#ef4444"
                      : material.status === "low"
                      ? "#facc15"
                      : "#22c55e",
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                    {material.name}
                    {material.status === "available" && (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                    {material.status === "low" && (
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    )}
                    {material.status === "critical" && (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </h3>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${
                      material.status === "available"
                        ? "bg-green-100 text-green-700"
                        : material.status === "low"
                        ? "bg-yellow-100 text-yellow-700"
                        : material.status === "critical"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {material.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Stock Level
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-gray-900">
                    {material.available}
                  </span>
                  <span className="text-gray-500">
                    / {material.required} {material.unit}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-2 rounded-full ${
                      material.status === "critical"
                        ? "bg-red-500"
                        : material.status === "low"
                        ? "bg-yellow-400"
                        : "bg-blue-500"
                    }`}
                    style={{
                      width: `${
                        material.required > 0
                          ? Math.min(
                              (material.available / material.required) * 100,
                              100
                            )
                          : 100
                      }%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-2">
                  <div>
                    <span className="block text-gray-400">Cost/Unit</span>
                    <span className="font-semibold text-gray-800">
                      ${material.cost}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Work Orders & Job Mapping */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Work Orders & Job Mapping
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {erpData.workOrders.map((order) => {
              const relatedJob = jobs.find(
                (job) => String(order.jobId) === job.id
              ); // Ensure type match
              return (
                <div key={order.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">{order.id}</div>
                      <div className="text-xs text-muted-foreground">
                        Job ID: {order.jobId} • Due:{" "}
                        {order.deadline.toLocaleDateString()}
                      </div>
                      {relatedJob && (
                        <div className="text-xs text-blue-600 mt-1">
                          → {relatedJob.name} on Machine {relatedJob.machineId}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(order.priority)}>
                        {order.priority.toUpperCase()}
                      </Badge>
                      <Badge
                        variant={
                          order.status === "in-progress"
                            ? "default"
                            : order.status === "delayed"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {order.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  {order.status === "delayed" && (
                    <Alert className="mt-2">
                      <TrendingDown className="h-3 w-3" />
                      <AlertDescription className="text-xs">
                        Work order is behind schedule. Consider priority
                        adjustment.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Shift Availability */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            Shift Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {erpData.shiftAvailability.map((shift) => (
              <div key={shift.shift} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{shift.shift}</span>
                  <span>
                    {shift.available}/{shift.total}
                  </span>
                </div>
                <Progress
                  value={(shift.available / shift.total) * 100}
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
