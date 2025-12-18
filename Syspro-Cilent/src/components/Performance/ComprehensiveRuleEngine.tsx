import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/UI/card";
import { Badge } from "@/components/UI/badge";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/UI/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Settings,
  Plus,
  Trash2,
  Eye,
  Clock,
  Users,
  Zap,
  AlertTriangle,
  Save,
  Play,
  Pause,
  RotateCcw,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/api";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/UI/alert";

export interface SchedulingRule {
  id: string;
  ruleName: string;
  category: "machine" | "shift" | "capacity" | "buffer" | "priority" | "custom";
  condition: {
    field: string;
    operator: "equals" | "greater_than" | "less_than" | "contains" | "between";
    value: any;
  };
  action: {
    type: "delay" | "reschedule" | "reassign" | "alert" | "block";
    parameters: Record<string, any>;
  };
  priority: number;
  enabled: boolean;
  jobDescription: string;
  createdAt: Date;
  lastModified: Date;
  appliedCount: number;
}

interface RuleTemplate {
  id: string;
  ruleName: string;
  jobDescription: string;
  category: SchedulingRule["category"];
  defaultValues: Partial<SchedulingRule>;
}

interface JobRule {
  id: string;
  ruleName: string;
  job: string;
  jobDescription: string;
  conditionValue: string;
  reason: string;
  enabled: boolean;
  appliedCount: number;
  lastModified: Date;
}

interface RuleEngineDashboard {
  totalRules: number;
  activeRules: number;
  lastExecution: string;
  rules: SchedulingRule[];
  executionStats: {
    success: number;
    warning: number;
    error: number;
  };
  recentExecutions: {
    id: string;
    ruleName: string;
    timestamp: string;
    description: string;
    status: "success" | "warning" | "error";
  }[];
}

interface ComprehensiveRuleEngineProps {
  initialRules: SchedulingRule[];
  onRulesUpdate: React.Dispatch<React.SetStateAction<SchedulingRule[]>>;
  isLoading: boolean;
}

const isValidSchedulingRule = (data: any): data is SchedulingRule => {
  if (!data || typeof data !== "object") return false;

  const validCategories = [
    "machine",
    "shift",
    "capacity",
    "buffer",
    "priority",
    "custom",
  ] as const;
  const validOperators = [
    "equals",
    "greater_than",
    "less_than",
    "contains",
    "between",
  ] as const;
  const validActionTypes = [
    "delay",
    "reschedule",
    "reassign",
    "alert",
    "block",
  ] as const;

  return (
    typeof data.id === "string" &&
    typeof data.ruleName === "string" &&
    validCategories.includes(data.category) &&
    data.condition &&
    typeof data.condition.field === "string" &&
    validOperators.includes(data.condition.operator) &&
    data.action &&
    validActionTypes.includes(data.action.type) &&
    typeof data.action.parameters === "object" &&
    typeof data.priority === "number" &&
    typeof data.enabled === "boolean" &&
    typeof data.jobDescription === "string" &&
    data.createdAt instanceof Date &&
    data.lastModified instanceof Date &&
    typeof data.appliedCount === "number"
  );
};

const transformAndValidateRule = (data: any): SchedulingRule | null => {
  if (!data || typeof data !== "object") return null;

  const validCategories = [
    "machine",
    "shift",
    "capacity",
    "buffer",
    "priority",
    "custom",
  ] as const;
  const validOperators = [
    "equals",
    "greater_than",
    "less_than",
    "contains",
    "between",
  ] as const;
  const validActionTypes = [
    "delay",
    "reschedule",
    "reassign",
    "alert",
    "block",
  ] as const;

  try {
    return {
      id: String(data.id || ""),
      ruleName: String(data.ruleName || data.RuleName || "Unnamed Rule"),
      category: validCategories.includes(data.category)
        ? data.category
        : "custom",
      condition: {
        field: String(data.condition?.field || ""),
        operator: validOperators.includes(data.condition?.operator)
          ? data.condition.operator
          : "equals",
        value: data.condition?.value,
      },
      action: {
        type: validActionTypes.includes(data.action?.type)
          ? data.action.type
          : "alert",
        parameters:
          typeof data.action?.parameters === "object"
            ? data.action.parameters
            : {},
      },
      priority: Math.min(10, Math.max(1, Number(data.priority) || 50)),
      enabled: Boolean(data.enabled),
      jobDescription: String(data.jobDescription || ""),
      createdAt:
        data.createdAt instanceof Date
          ? data.createdAt
          : new Date(data.createdAt || Date.now()),
      lastModified:
        data.lastModified instanceof Date
          ? data.lastModified
          : new Date(data.lastModified || Date.now()),
      appliedCount: Math.max(0, Number(data.appliedCount) || 0),
    };
  } catch (error) {
    console.error("Error transforming rule:", error);
    return null;
  }
};

const transformApiRule = (apiRule: any): SchedulingRule => {
  try {
    // Try to parse condition if it's a string
    let condition = { 
      field: '', 
      operator: 'equals' as 'equals' | 'greater_than' | 'less_than' | 'contains' | 'between', 
      value: '' 
    };
    if (typeof apiRule.condition === 'string') {
      try {
        const parsed = JSON.parse(apiRule.condition);
        if (parsed && typeof parsed === 'object') {
          condition = {
            field: parsed.field || '',
            operator: ['equals', 'greater_than', 'less_than', 'contains', 'between'].includes(parsed.operator)
              ? parsed.operator as SchedulingRule['condition']['operator']
              : 'equals',
            value: parsed.value ?? ''
          };
        }
      } catch (e) {
        // If parsing fails, use the string as the value
        condition.value = apiRule.condition;
      }
    } else if (apiRule.condition && typeof apiRule.condition === 'object') {
      condition = {
        field: apiRule.condition.field || '',
        operator: ['equals', 'greater_than', 'less_than', 'contains', 'between'].includes(apiRule.condition.operator)
          ? apiRule.condition.operator as SchedulingRule['condition']['operator']
          : 'equals',
        value: apiRule.condition.value ?? ''
      };
    }

    // Parse action
    let action: SchedulingRule['action'] = { type: 'alert', parameters: {} };
    if (apiRule.action) {
      if (typeof apiRule.action === 'string') {
        try {
          const parsedAction = JSON.parse(apiRule.action);
          if (parsedAction && typeof parsedAction === 'object') {
            action = {
              type: ['delay', 'reschedule', 'reassign', 'alert', 'block'].includes(parsedAction.type)
                ? parsedAction.type as SchedulingRule['action']['type']
                : 'alert',
              parameters: parsedAction.parameters || {}
            };
          }
        } catch (e) {
          // If parsing fails, use default action
        }
      } else if (typeof apiRule.action === 'object') {
        action = {
          type: ['delay', 'reschedule', 'reassign', 'alert', 'block'].includes(apiRule.action.type)
            ? apiRule.action.type as SchedulingRule['action']['type']
            : 'alert',
          parameters: apiRule.action.parameters || {}
        };
      }
    }

    return {
      id: apiRule.id || `rule-${Math.random().toString(36).substr(2, 9)}`,
      ruleName: apiRule.name || apiRule.ruleName || 'Unnamed Rule',
      category: ['machine', 'shift', 'capacity', 'buffer', 'priority', 'custom'].includes(apiRule.category)
        ? apiRule.category as SchedulingRule['category']
        : 'custom',
      condition,
      action,
      priority: typeof apiRule.priority === 'number' ? apiRule.priority : 0,
      enabled: Boolean(apiRule.isActive ?? apiRule.enabled ?? true),
      jobDescription: apiRule.description || apiRule.jobDescription || '',
      createdAt: apiRule.createdAt ? new Date(apiRule.createdAt) : new Date(),
      lastModified: apiRule.updatedAt ? new Date(apiRule.updatedAt) : new Date(),
      appliedCount: typeof apiRule.appliedCount === 'number' ? apiRule.appliedCount : 0,
      // Map any additional fields that might be needed
      ...(apiRule.field && { field: apiRule.field }),
      ...(apiRule.operator && { operator: apiRule.operator }),
      ...(apiRule.value !== undefined && { value: apiRule.value })
    };
  } catch (error) {
    console.error('Error transforming rule:', error, apiRule);
    // Return a default rule in case of error
    return {
      id: `error-${Math.random().toString(36).substr(2, 9)}`,
      ruleName: 'Error Loading Rule',
      category: 'custom',
      condition: { field: '', operator: 'equals', value: '' },
      action: { type: 'alert', parameters: {} },
      priority: 0,
      enabled: false,
      jobDescription: 'Error loading this rule',
      createdAt: new Date(),
      lastModified: new Date(),
      appliedCount: 0
    };
  }
};

const JobRuleCard: React.FC<{ rule: JobRule }> = ({ rule }) => {
  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold">{rule.ruleName}</h4>
              <Badge variant="outline" className="text-xs">
                {rule.enabled ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {rule.jobDescription}
            </p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Job: </span>
                <span>{rule.job}</span>
              </div>
              <div>
                <span className="font-medium">Condition: </span>
                {["50", "51", "52"].includes(rule.conditionValue) ? (
                  <Badge variant="secondary" className="ml-1">
                    Priority: {rule.conditionValue}
                  </Badge>
                ) : (
                  <span>
                    {Math.abs(Number(rule.conditionValue) / 1440).toFixed(1)}{" "}
                    days
                  </span>
                )}
              </div>
              <div className="col-span-2">
                <span className="font-medium">Reason: </span>
                <Badge
                  variant={
                    rule.reason.includes("High Priority")
                      ? "default"
                      : "destructive"
                  }
                >
                  {rule.reason}
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground text-right">
            <div>Applied: {rule.appliedCount} times</div>
            <div>
              Last modified:{" "}
              {formatDistanceToNow(new Date(rule.lastModified), {
                addSuffix: true,
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ComprehensiveRuleEngine: React.FC<
  ComprehensiveRuleEngineProps
> = ({ initialRules, onRulesUpdate, isLoading: propIsLoading }) => {
  const [dashboardData, setDashboardData] =
    useState<RuleEngineDashboard | null>(null);
  const [rules, setRules] = useState<SchedulingRule[]>(initialRules);
  const [isLoading, setIsLoading] = useState(propIsLoading);
  const [error, setError] = useState<string | null>(null);

  // Sync local state with props
  useEffect(() => {
    setRules(initialRules);
  }, [initialRules]);

  // Sync loading state with props
  useEffect(() => {
    setIsLoading(propIsLoading);
  }, [propIsLoading]);

  // Update parent when rules change
  useEffect(() => {
    onRulesUpdate(rules);
  }, [rules, onRulesUpdate]);

  const [ruleTemplates, setRuleTemplates] = useState<RuleTemplate[]>([
    {
      id: "template-1",
      ruleName: "High Priority Job Rule",
      jobDescription: "Prioritize high priority jobs",
      category: "priority",
      defaultValues: {
        priority: 1,
        condition: {
          field: "priority",
          operator: "equals",
          value: "high",
        },
        action: {
          type: "reschedule",
          parameters: { position: "top" },
        },
      },
    },
    {
      id: "template-2",
      ruleName: "Machine Maintenance Rule",
      jobDescription: "Block scheduling during maintenance",
      category: "machine",
      defaultValues: {
        condition: {
          field: "status",
          operator: "equals",
          value: "maintenance",
        },
        action: {
          type: "block",
          parameters: { reason: "Scheduled maintenance" },
        },
      },
    },
  ]);
  const [newRule, setNewRule] = useState<Partial<SchedulingRule>>({
    ruleName: "",
    category: "machine",
    condition: {
      field: "",
      operator: "equals",
      value: "",
    },
    action: {
      type: "delay",
      parameters: {},
    },
    priority: 5,
    enabled: true,
    jobDescription: "",
  });

  const [activeTab, setActiveTab] = useState("rules");
  const [isSimulating, setIsSimulating] = useState(false);

  const processApiResponse = (response: any) => {
    if (Array.isArray(response)) {
      const processedRules = response.map((r: any) => ({
        id: r.job || Date.now().toString(),
        ruleName:
          typeof r.ruleName === "string" && r.ruleName.trim()
            ? r.ruleName.trim()
            : typeof r.RuleName === "string" && r.RuleName.trim()
            ? r.RuleName.trim()
            : "Priority Job Fast Track", // cover both cases
        category: "custom" as const,
        condition: {
          field: "Job",
          operator: "equals" as const,
          value: r.conditionValue || "",
        },
        action: { type: "alert" as const, parameters: {} },
        priority: Number(r.conditionValue) || 50,
        enabled: r.isActive ?? true,
        jobDescription:
          r.jobDescription ?? r.JobDescription ?? "No description available", 
        createdAt: new Date(),
        lastModified: new Date(),
        appliedCount: 0,
      }));

      setRules(processedRules);
      setDashboardData({
        totalRules: processedRules.length,
        activeRules: processedRules.filter((r) => r.enabled).length,
        lastExecution: new Date().toISOString(),
        rules: processedRules,
        executionStats: { success: 0, warning: 0, error: 0 },
        recentExecutions: [],
      });
    } else if (response.rules && Array.isArray(response.rules)) {
      const validatedRules = response.rules
        .map(transformAndValidateRule)
        .filter((rule): rule is SchedulingRule => rule !== null);
      setRules(validatedRules);
      setDashboardData(response);
    } else {
      console.log("No rules found in response");
      setRules([]);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Fetching rules from API...");
      const response = await apiService.getRuleEngineDashboard();
      console.log("Raw API Response:", response);

      if (!response) {
        throw new Error('No response received from the server');
      }

      // Transform the response to match the expected type
      const transformedData: RuleEngineDashboard = {
        totalRules: response.totalRules || 0,
        activeRules: response.activeRules || 0,
        lastExecution: response.lastExecution || new Date().toISOString(),
        executionStats: {
          success: response.executionStats?.success || 0,
          warning: response.executionStats?.warning || 0,
          error: response.executionStats?.error || 0,
        },
        recentExecutions: (response.recentExecutions || []).map(exec => ({
          id: exec.id || `exec-${Math.random().toString(36).substr(2, 9)}`,
          ruleName: exec.ruleName || 'Unknown Rule',
          timestamp: exec.timestamp || new Date().toISOString(),
          description: exec.description || 'No description available',
          status: ['success', 'warning', 'error'].includes(exec.status)
            ? exec.status as 'success' | 'warning' | 'error'
            : 'error'
        })),
        rules: (response.rules || []).map(rule => transformApiRule(rule))
      };

      setDashboardData(transformedData);

      // Update the rules state with the transformed rules
      const validatedRules = transformedData.rules
        .map(rule => transformAndValidateRule(rule))
        .filter((rule): rule is SchedulingRule => rule !== null);
      
      setRules(validatedRules);
      
      // Call the onRulesUpdate callback if provided
      if (onRulesUpdate) {
        onRulesUpdate(validatedRules);
      }

    } catch (err) {
      const error = err as Error;
      console.error("Error fetching rules:", error);
      setError(error.message || 'Failed to fetch rules');
      // Optionally show a toast or notification to the user
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getRuleEngineDashboard(); // This need to be changed to fetchRuleEngineDashboard and check
        processApiResponse(data);
      } catch (err) {
        console.error("Failed to fetch rule engine dashboard data:", err);
        setError("Failed to load rule engine dashboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const addRule = () => {
    if (!newRule.ruleName || !newRule.condition?.field) {
      toast.error("Please fill in all required fields");
      return;
    }

    const rule: SchedulingRule = {
      id: Date.now().toString(),
      ruleName: newRule.ruleName!,
      category: newRule.category!,
      condition: newRule.condition!,
      action: newRule.action!,
      priority: newRule.priority!,
      enabled: newRule.enabled!,
      jobDescription: newRule.jobDescription!,
      createdAt: new Date(),
      lastModified: new Date(),
      appliedCount: 0,
    };

    setRules([...rules, rule]);
    setNewRule({
      ruleName: "",
      category: "machine",
      condition: { field: "", operator: "equals", value: "" },
      action: { type: "delay", parameters: {} },
      priority: 5,
      enabled: true,
      jobDescription: "",
    });

    toast.success("Rule added successfully");
  };

  const deleteRule = async (id: string) => {
    try {
      console.log("Attempting to delete rule with ID:", id);

      // First find the rule to get the correct job identifier
      const ruleToDelete = rules.find((rule) => rule.id === id);
      if (!ruleToDelete) {
        throw new Error("Rule not found");
      }

      // Use the rule ID directly since the job property doesn't exist
      const jobId = id;
      console.log("Using job ID for deletion:", jobId);

      const response = await fetch(
        `/api/rule-engine/job/${encodeURIComponent(jobId)}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Delete request failed:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });
        throw new Error(
          errorData?.message ||
            `Failed to delete rule: ${response.status} ${response.statusText}`
        );
      }

      // Remove the rule from the local state
      setRules(rules.filter((rule) => rule.id !== id));
      toast.success("Rule deleted successfully");
    } catch (error) {
      console.error("Error deleting rule:", error);
      toast.error(`Failed to delete rule: ${error.message}`);
    }
  };

  const toggleRule = (id: string) => {
    setRules(
      rules.map((rule) =>
        rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  const updateRulePriority = (id: string, priority: number) => {
    setRules(
      rules.map((rule) =>
        rule.id === id ? { ...rule, priority, lastModified: new Date() } : rule
      )
    );
  };

  const simulateRules = () => {
    setIsSimulating(true);
    toast.info("Simulating rule engine...");

    setTimeout(() => {
      setIsSimulating(false);
      const activeRules = rules.filter((r) => r.enabled);
      toast.success("Simulation complete", {
        description: `${activeRules.length} rules would be applied to current schedule`,
      });
    }, 2000);
  };

  const applyTemplate = (template: RuleTemplate) => {
    const rule: SchedulingRule = {
      id: Date.now().toString(),
      ruleName: template.ruleName,
      category: template.category,
      condition: template.defaultValues.condition || {
        field: "",
        operator: "equals",
        value: "",
      },
      action: template.defaultValues.action || {
        type: "delay",
        parameters: {},
      },
      priority: template.defaultValues.priority || 50,
      enabled: true,
      jobDescription: template.jobDescription,
      createdAt: new Date(),
      lastModified: new Date(),
      appliedCount: 0,
    };

    setRules([...rules, rule]);
    toast.success(`Template "${template.ruleName}" applied`);
  };

  const getCategoryColor = (category: SchedulingRule["category"]) => {
    switch (category) {
      case "machine":
        return "bg-blue-100 text-blue-800";
      case "shift":
        return "bg-green-100 text-green-800";
      case "capacity":
        return "bg-purple-100 text-purple-800";
      case "buffer":
        return "bg-orange-100 text-orange-800";
      case "priority":
        return "bg-red-100 text-red-800";
      case "custom":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: SchedulingRule["category"]) => {
    switch (category) {
      case "machine":
        return <Settings className="w-4 h-4" />;
      case "shift":
        return <Clock className="w-4 h-4" />;
      case "capacity":
        return <Users className="w-4 h-4" />;
      case "buffer":
        return <Zap className="w-4 h-4" />;
      case "priority":
        return <AlertTriangle className="w-4 h-4" />;
      case "custom":
        return <Plus className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const sortedRules = [...rules].sort((a, b) => b.priority - a.priority);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Comprehensive Rule Engine
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={simulateRules}
                disabled={isSimulating}
                variant="outline"
                size="sm"
              >
                {isSimulating ? (
                  <Pause className="w-4 h-4 mr-2" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {isSimulating ? "Simulating..." : "Test Rules"}
              </Button>
              <Button onClick={() => toast.success("Rules saved")} size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save All
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {rules.filter((r) => r.enabled).length} of {rules.length} rules
              active
            </span>
            <span>
              Total applications:{" "}
              {rules.reduce((sum, rule) => sum + rule.appliedCount, 125)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rules">Active Rules</TabsTrigger>
          <TabsTrigger value="create">Create Rule</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <div className="space-y-4">
            {sortedRules.length > 0 ? (
              sortedRules.map((rule) => {
                console.log("Rendering rule:", rule.id, rule.ruleName);
                return (
                  <Card key={`${rule.id}-${rule.ruleName}`} className="border-l-4 border-l-primary">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          {getCategoryIcon(rule.category)}
                          <div>
                            <h3 className="font-semibold text-lg">
                              {rule.ruleName }
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              {rule.jobDescription ||
                                "No description available"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getCategoryColor(rule.category)}>
                            {rule.category || "custom"}
                          </Badge>
                          <Switch
                            checked={!!rule.enabled}
                            onCheckedChange={() => toggleRule(rule.id)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Priority Level
                          </label>
                          <div className="flex items-center gap-2">
                            <Slider
                              value={[rule.priority || 50]}
                              onValueChange={([value]) =>
                                updateRulePriority(rule.id, value)
                              }
                              max={100}
                              min={1}
                              step={1}
                              className="flex-1"
                            />
                            <span className="text-sm font-medium w-8">
                              {rule.priority || 50}
                            </span>
                          </div>
                        </div>
                        {/* <div className="space-y-2">
                          <label className="text-sm font-medium">Performance</label>
                          <div className="text-sm text-muted-foreground">
                            Applied {rule.appliedCount || 0} times
                          </div>
                        </div> */}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          Modified:{" "}
                          {rule.lastModified
                            ? new Date(rule.lastModified).toLocaleDateString()
                            : "N/A"}
                        </div>
                        <Button
                          onClick={() => deleteRule(rule.id)}
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="text-center p-8 border rounded-lg">
                <p className="text-muted-foreground">
                  No rules found. Create your first rule to get started.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Rule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rule Name</label>
                  <Input
                    placeholder="Enter rule name"
                    value={newRule.ruleName || ""}
                    onChange={(e) =>
                      setNewRule({ ...newRule, ruleName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={newRule.category}
                    onValueChange={(value: SchedulingRule["category"]) =>
                      setNewRule({ ...newRule, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="machine">Machine</SelectItem>
                      <SelectItem value="shift">Shift</SelectItem>
                      <SelectItem value="capacity">Capacity</SelectItem>
                      <SelectItem value="buffer">Buffer</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Describe what this rule does"
                  value={newRule.jobDescription || ""}
                  onChange={(e) =>
                    setNewRule({ ...newRule, jobDescription: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Condition Field</label>
                  <Select
                    value={newRule.condition?.field || ""}
                    onValueChange={(value) =>
                      setNewRule({
                        ...newRule,
                        condition: { ...newRule.condition!, field: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="machine_id">Machine ID</SelectItem>
                      <SelectItem value="job_priority">Job Priority</SelectItem>
                      <SelectItem value="time_slot">Time Slot</SelectItem>
                      <SelectItem value="operator_skill">
                        Operator Skill
                      </SelectItem>
                      <SelectItem value="material_availability">
                        Material Availability
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Operator</label>
                  <Select
                    value={newRule.condition?.operator || "equals"}
                    onValueChange={(value: any) =>
                      setNewRule({
                        ...newRule,
                        condition: { ...newRule.condition!, operator: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="greater_than">Greater Than</SelectItem>
                      <SelectItem value="less_than">Less Than</SelectItem>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="between">Between</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Value</label>
                  <Input
                    placeholder="Condition value"
                    value={newRule.condition?.value || ""}
                    onChange={(e) =>
                      setNewRule({
                        ...newRule,
                        condition: {
                          ...newRule.condition!,
                          value: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Action Type</label>
                  <Select
                    value={newRule.action?.type || "delay"}
                    onValueChange={(value: any) =>
                      setNewRule({
                        ...newRule,
                        action: { ...newRule.action!, type: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delay">Delay</SelectItem>
                      <SelectItem value="reschedule">Reschedule</SelectItem>
                      <SelectItem value="reassign">Reassign</SelectItem>
                      <SelectItem value="alert">Alert</SelectItem>
                      <SelectItem value="block">Block</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority (1-100)</label>
                  <Slider
                    value={[newRule.priority || 50]}
                    onValueChange={([value]) =>
                      setNewRule({ ...newRule, priority: value })
                    }
                    max={100}
                    min={1}
                    step={1}
                  />
                </div>
              </div>

              <Button onClick={addRule} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Create Rule
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ruleTemplates.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(template.category)}
                      <h3 className="font-semibold">{template.ruleName}</h3>
                    </div>
                    <Badge className={getCategoryColor(template.category)}>
                      {template.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {template.jobDescription}
                  </p>
                  <Button
                    onClick={() => applyTemplate(template)}
                    size="sm"
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Apply Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">
              Rule Engine Analytics
            </h2>
            {dashboardData?.recentExecutions?.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-full">
                  <CardHeader>
                    <CardTitle>Recent Executions</CardTitle>
                    <CardDescription>
                      Latest rule executions and their status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.recentExecutions.map((execution) => (
                        <div
                          key={execution.id}
                          className="flex items-center p-3 border rounded-lg"
                        >
                          <div
                            className={`p-2 rounded-full ${
                              execution.status === "success"
                                ? "bg-green-100 text-green-600"
                                : execution.status === "warning"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {execution.status === "success" ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : execution.status === "warning" ? (
                              <Clock className="h-5 w-5" />
                            ) : (
                              <Zap className="h-5 w-5" />
                            )}
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">
                                {execution.ruleName}
                              </h4>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(
                                  new Date(execution.timestamp),
                                  { addSuffix: true }
                                )}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {execution.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
