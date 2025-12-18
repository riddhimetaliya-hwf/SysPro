import {
  ApiResponse,
  Job,
  Machine,
  ApiJob,
  ApiMachine,
  ApiMaterial,
  Material,
  TokenResponse,
  SchedulingRule,
  JobDashboardItem,
  JobUpdateRequest,
  JobDependency,
} from "@/types/jobs";
import { config } from "@/config/environment";
import { format } from "date-fns";

interface ProductInventory {
  stockCode: string;
  productName: string;
  source: string;
  quantityOnHand: number;
  totalPrice: number;
  quantityRequired: number;
}

interface JobConflict {
  job: string;
  jobDescription: string;
  machine: string;
  impactScore: number;
  urgency: string;
  complexity: string;
  conflictReason: string;
}

interface RuleEngineDashboard {
  totalRules: number;
  activeRules: number;
  lastExecution: string;
  executionStats: {
    success: number;
    warning: number;
    error: number;
  };
  recentExecutions: Array<{
    id: string;
    timestamp: string;
    status: "success" | "warning" | "error";
    ruleName: string;
    description: string;
  }>;
  rules: SchedulingRule[];
}
export interface PerformanceAnalytics {
  averageJobCompletionTime: number;
  onTimeDeliveryRate: number;
  machineUtilization: {
    machineId: string;
    machineName: string;
    utilizationRate: number;
    downtime: number;
  }[];
  jobMetrics: {
    jobId: string;
    jobName: string;
    scheduledDuration: number;
    actualDuration: number;
    delay: number;
    status: "OnTime" | "Delayed" | "AheadOfSchedule";
  }[];
  metricsByTimePeriod: {
    period: string;
    jobsCompleted: number;
    averageDelay: number;
    utilizationRate: number;
  }[];
  alerts: {
    type: "high_delay" | "low_utilization" | "bottleneck";
    message: string;
    severity: "low" | "medium" | "high";
    affectedItems: string[];
    suggestedActions: string[];
  }[];
}

class ApiService {
  private baseUrl: string;
  private _schedulingPromise: Promise<{ jobs: Job[]; machines: Machine[] }> | null = null;
  private schedulingCache: { timestamp: number; data: { jobs: Job[]; machines: Machine[] } } | null = null;
  private schedulingCacheTTL = 5000;
  private _updateJobPromises: Map<string, Promise<Job>> = new Map();

  invalidateSchedulingCache(): void {
    this.schedulingCache = null;
    this._schedulingPromise = null;
  }

  constructor(baseUrl: string = config.api.baseUrl) {
    this.baseUrl = baseUrl;
  }

  // ----------------- CORE JOB FETCHER -----------------
  async fetchJobs(): Promise<Job[]> {
    const { jobs } = await this.fetchSchedulingData();
    return jobs;
  }

  //------------IMPROVED API CALL HANDLER------------
  private async handleApiCall<T>(
    fetchCall: () => Promise<Response>,
    defaultReturn: T,
    endpointName: string
  ): Promise<T> {
    try {
      const response = await fetchCall();
      
      if (response.status === 204) {
        return defaultReturn;
      }

      if (response.status >= 400 && response.status < 500) {
        const errorText = await response.text();
        console.error(`❌ ${endpointName} Client Error (${response.status}):`, errorText);
        
        if (response.status === 400) {
          throw new Error(`Bad request: Please check your input parameters for ${endpointName}`);
        }
        if (response.status === 404) {
          throw new Error(`Endpoint not found: ${endpointName}`);
        }
        
        throw new Error(`Client error ${response.status}: ${errorText}`);
      }

      if (response.status >= 500) {
        console.error(`🚨 ${endpointName} Server Error (${response.status})`);
        throw new Error(`Server error: ${endpointName} is currently unavailable. Please try again later.`);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error(`💥 ${endpointName} Exception:`, error);
      
      const nonCriticalEndpoints = ['fetchProducts', 'fetchJobConflicts', 'fetchPerformanceAnalytics'];
      if (nonCriticalEndpoints.includes(endpointName)) {
        console.warn(`⚠️ Returning default for ${endpointName} due to error`);
        return defaultReturn;
      }
      
      throw error instanceof Error ? error : new Error(`Failed to call ${endpointName}`);
    }
  }

  async fetchJobDependencies(masterJobId?: string): Promise<JobDependency[]> {
    
    return this.handleApiCall(
      async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.api.timeout);
  
        try {
          let url = this.baseUrl + "/api/dependencies";
          if (masterJobId) {
            const cleanJobId = masterJobId.replace(/^0+/, '') || '0';
            url += `?masterJob=${encodeURIComponent(cleanJobId)}`;
          }
  
          const response = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          return response;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      },
      [],
      "fetchJobDependencies"
    ).then(data => {
      
      const dependencies = Array.isArray(data) ? data : (data as any)?.dependencies || [];
      
      return dependencies.map((dep: any) => ({
        DependentJob: String(dep.dependentJob || dep.DependentJob || ''),
        DependentDescription: String(dep.dependentDescription || dep.DependentDescription || ''),
        JobType: String(dep.jobType || dep.JobType || ''),
        MasterJob: String(dep.masterJob || dep.MasterJob || '')
      }));
    }).catch(error => {
      console.error('❌ Error in fetchJobDependencies:', error);
      return [];
    });
  }

  // ----------------- NEW: FETCH PRODUCTS -----------------
  async fetchProducts(): Promise<string[]> {
    return this.handleApiCall(
      async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.api.timeout);

        try {
          const response = await fetch(this.baseUrl + "/api/jobfilter/jobs-by-product", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          return response;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      },
      [],
      "fetchProducts"
    ).then(data => {
      if (Array.isArray(data) && typeof data[0] === "object") {
        return data.map((p: { productName?: string; name?: string } | string) => 
          typeof p === 'object' ? (p.productName ?? p.name ?? String(p)) : String(p)
        );
      }
      return data;
    });
  }

  async fetchSchedulingData(forceRefresh: boolean = false): Promise<{ jobs: Job[]; machines: Machine[] }> {
    try {
      const now = Date.now();
      
      if (forceRefresh) {
        this.schedulingCache = null;
        this._schedulingPromise = null;
      }
      
      if (!forceRefresh && this.schedulingCache && (now - this.schedulingCache.timestamp) < this.schedulingCacheTTL) {
        return this.schedulingCache.data;
      }
      
      if (this._schedulingPromise && !forceRefresh) {
        return this._schedulingPromise;
      }
      
      
      this._schedulingPromise = (async () => {
        const result = await this.handleApiCall(
          async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), config.api.timeout);
            
            try {
              const cacheBuster = forceRefresh ? `?_t=${Date.now()}` : '';
              const url = this.baseUrl + "/api/scheduling/job" + cacheBuster;
              
              const response = await fetch(url, {
                method: "GET",
                headers: { 
                  "Content-Type": "application/json",
                  ...(forceRefresh && {
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    "Pragma": "no-cache",
                    "Expires": "0"
                  })
                },
                signal: controller.signal,
              });
              clearTimeout(timeoutId);
              return response;
            } catch (error) {
              clearTimeout(timeoutId);
              throw error;
            }
          },
          { jobs: [], machines: [] }, 
          "fetchSchedulingData"
        );
        
        const converted = await this.convertApiResponse(result);
        
        if (!forceRefresh) {
          this.schedulingCache = { timestamp: Date.now(), data: converted };
        }
        
        
        return converted;
      })();
  
      return this._schedulingPromise;
    } catch (error) {
      console.error("❌ Error fetching scheduling data:", error);
      this._schedulingPromise = null;
      throw error;
    } finally {
      setTimeout(() => {
        this._schedulingPromise = null;
      }, 100);
    }
  }

  async fetchSmartAlerts(): Promise<Array<{
    job: string;
    stockCode: string;
    stockDescription: string;
    materialPresent: number;
    materialRequired: number;
    impactScore: number;
  }>> {
    return this.handleApiCall(
      async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.api.timeout);

        try {
          const response = await fetch(this.baseUrl + "/api/smart-alert/alert", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          return response;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      },
      [], 
      "fetchSmartAlerts"
    ).then(raw => {
      const data = Array.isArray(raw) ? raw : (raw as { alerts?: unknown[] })?.alerts ?? [];

      const toNumber = (v: unknown): number | undefined => {
        if (v === null || v === undefined || v === "") return undefined;
        const n = Number(v);
        return Number.isFinite(n) ? n : undefined;
      };

      const get = (obj: Record<string, unknown>, keys: string[]): unknown => {
        for (const k of keys) {
          if (obj && Object.prototype.hasOwnProperty.call(obj, k) && obj[k] !== undefined) {
            return obj[k];
          }
        }
        return undefined;
      };

      return data.map((item: Record<string, unknown>) => ({
        job: String(get(item, ["job", "Job", "jobId", "JobId", "workOrderId", "WorkOrderId"]) ?? ""),
        stockCode: String(get(item, ["stockCode", "StockCode", "materialCode", "MaterialCode", "code", "Code"]) ?? ""),
        stockDescription: String(get(item, ["stockDescription", "StockDescription", "materialDescription", "MaterialDescription", "description", "Description"]) ?? ""),
        materialPresent: toNumber(get(item, ["materialPresent", "MaterialPresent", "present", "Present", "inHand", "InHand", "stockInHand", "StockInHand"])) ?? 0,
        materialRequired: toNumber(get(item, ["materialRequired", "MaterialRequired", "required", "Required", "requiredQty", "RequiredQty", "unitQtyReqd", "UnitQtyReqd"])) ?? 0,
        impactScore: toNumber(get(item, ["impactScore", "ImpactScore", "score", "Score"])) ?? 0,
      }));
    });
  }

   //------------------ADVANCED ANALYTICS FETCHER -----------------
  async fetchPerformanceAnalytics(
    timeRange: string = '30d',
    machineId?: string
  ): Promise<PerformanceAnalytics> {
    try {
    
      const params = new URLSearchParams();
      params.append('timeRange', timeRange);
      if (machineId) {
        params.append('machineId', machineId);
      }

      const response = await fetch(
        `${this.baseUrl}/api/advanced-analysis/performance-analytics?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

    
      if (response.status === 204) {
        return this.getDefaultPerformanceAnalytics();
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to fetch performance analytics: ${response.status} - ${JSON.stringify(errorData)}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching performance analytics:', error);
      return this.getDefaultPerformanceAnalytics();
    }
  }

  // ----------------- FETCH JOB DASHBOARD -----------------
  async fetchJobDashboard(): Promise<JobDashboardItem[]> {
    return this.handleApiCall(
      async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.api.timeout);

        try {
          const response = await fetch(this.baseUrl + "/api/scheduling/job-dashboard", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          return response;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      },
      [], 
      "fetchJobDashboard"
    ).then(raw => {
      return Array.isArray(raw)
        ? raw.map((item: Record<string, unknown>): JobDashboardItem => ({
            job: String(item.job ?? ""),
            jobDescription: String(item.jobDescription ?? ""),
            machine: String(item.machine ?? ""),
            jobStartDate: typeof item.jobStartDate === 'string' ? item.jobStartDate : null,
            jobEndDate: typeof item.jobEndDate === 'string' ? item.jobEndDate : null,
            jobStatus: item.jobStatus ? this.mapApiStatus(String(item.jobStatus)) : "Active",
          }))
        : [];
    });
  }

  async getRuleEngineDashboard(): Promise<RuleEngineDashboard> {

    try {
      const response = await fetch("/api/rule-engine/dashboard", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.status === 204) {
        return this.getDefaultRuleEngineDashboard();
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      const transformedData: RuleEngineDashboard = {
        totalRules: data.kpIs?.totalRules || 0,
        activeRules: data.kpIs?.activeRules || 0,
        lastExecution: new Date().toISOString(), 
        executionStats: {
          success: data.kpIs?.totalRules || 0, 
          warning: 0, 
          error: 0, 
        },
        recentExecutions: (data.rules || []).map((rule: SchedulingRule) => ({
          id: rule.id || "",
          ruleName: rule.ruleName || "",
          timestamp: new Date().toISOString(), 
          description: rule.ruleName || "",
          status: rule.isActive ? "success" : "error",
        })),
        rules: data.rules || [],
      };

      return transformedData;
    } catch (error) {
      console.error("Error in getRuleEngineDashboard:", error);
      return this.getDefaultRuleEngineDashboard();
    }
  }

   async fetchJobConflicts(jobIds: string[]): Promise<JobConflict[]> {

    const validJobIds = jobIds?.filter(id => id != null && id !== '') || [];
    let url: string;
    
    if (validJobIds.length === 0) {
      url = `${this.baseUrl}/api/scheduling/job-conflict`;
    } else {
      const jobIdsParam = validJobIds.join(",");
      url = `${this.baseUrl}/api/scheduling/job-conflict?jobIds=${encodeURIComponent(jobIdsParam)}`;
    }


    return this.handleApiCall(
      async () => {
        const response = await fetch(url, {
          method: "GET",
          headers: { 'Content-Type': 'application/json' },
        });
        return response;
      },
      [],
      "fetchJobConflicts"
    ).then(data => {
      if (!Array.isArray(data)) {
        console.warn("⚠️ Expected array of conflicts but received:", data);
        return [];
      }

      return data.map((item: Record<string, unknown>) => ({
        job: String(item.Job || item.job || 'Unknown Job'),
        jobDescription: String(item.JobDescription || item.jobDescription || 'No description'),
        machine: String(item.Machine || item.machine || 'No Machine'),
        impactScore: Number(item.ImpactScore ?? item.impactScore ?? 0),
        urgency: String(item.Urgency || item.urgency || 'Medium'),
        complexity: String(item.Complexity || item.complexity || 'Medium'),
        conflictReason: String(item.ConflictReason || item.conflictReason || 'Scheduling conflict detected'),
      }));
    });
  }

  // Helper function to extract user-friendly error message from JSON
  private extractErrorMessage(responseText: string): string {
    try {
      const jsonResponse = JSON.parse(responseText);
      
      // Check common error message fields
      if (jsonResponse.Message) {
        return jsonResponse.Message;
      }
      if (jsonResponse.message) {
        return jsonResponse.message;
      }
      if (jsonResponse.error) {
        return typeof jsonResponse.error === 'string' ? jsonResponse.error : jsonResponse.error.message || JSON.stringify(jsonResponse.error);
      }
      if (jsonResponse.errorMessage) {
        return jsonResponse.errorMessage;
      }
      
      // If no standard field found, return the whole text
      return responseText;
    } catch (e) {
      // If it's not valid JSON, return the text as-is
      return responseText;
    }
  }

  async updateJob(jobId: string, jobData: Job | JobUpdateRequest): Promise<Job> {
    if (this._updateJobPromises.has(jobId)) {
      this._updateJobPromises.delete(jobId);
    }
  
    const p = (async (): Promise<Job> => {
      try {
        let sourceJob: Job;
  
        if ('id' in jobData) {
          sourceJob = jobData as Job;
        } else {
          const jobUpdate = jobData as JobUpdateRequest;
          sourceJob = {
            id: jobUpdate.jobId,
            name: jobUpdate.name,
            description: jobUpdate.description,
            machineId: jobUpdate.machineId,
            startDate: jobUpdate.startDate ? new Date(jobUpdate.startDate) : null,
            endDate: jobUpdate.endDate ? new Date(jobUpdate.endDate) : null,
            conflictType: jobUpdate.conflictType,
            conflictDetails: jobUpdate.conflictDetails,
            hasDependency: jobUpdate.hasDependency,
            dependencies: jobUpdate.dependencies,
            materials: jobUpdate.materials,
            product: jobUpdate.product,
            status: undefined,
            priority: 'medium',
          };
        }
  
        if (!sourceJob.startDate) {
          throw new Error("Invalid startDate provided");
        }
  
        const formattedDate = format(sourceJob.startDate, "yyyy-MM-dd");
        const requestBody: Record<string, unknown> = { 
          JobNumber: sourceJob.id, 
          JobScheduleDate: formattedDate,
          MachineId: sourceJob.machineId
        };
  
        const response = await fetch(`${this.baseUrl}/api/scheduling/update-job`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });
  
        const responseText = await response.text();
  
        if (response.status === 204) {
          this.invalidateSchedulingCache();
          return sourceJob;
        }
  
        if (response.status === 200) {
          this.invalidateSchedulingCache();
          
          if (responseText) {
            try {
              const responseData = JSON.parse(responseText);
              if (responseData.success) {
                return sourceJob;
              }
            } catch (e) {
              return sourceJob;
            }
          }
          return sourceJob;
        }
  
        // Extract clean error message from JSON response
        const errorMessage = this.extractErrorMessage(responseText);
        
        if (errorMessage.includes("An error has occurred")) {
          console.error("❌ Backend error detected");
          throw new Error(errorMessage);
        }
  
        if (!response.ok) {
          console.error("❌ API Error:", response.status, responseText);
          throw new Error(errorMessage);
        }
        
        this.invalidateSchedulingCache();
        return sourceJob;
  
      } catch (error) {
        console.error("🚨 Error in updateJob:", error);
        throw error instanceof Error ? error : new Error("Unknown error occurred");
      } finally {
        this._updateJobPromises.delete(jobId);
      }
    })();
  
    this._updateJobPromises.set(jobId, p);
    return p;
  }

  public async waitForBackendSync(jobId: string, expectedMachineId: string, maxAttempts: number = 5): Promise<boolean> {
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const delay = Math.min(1000 * Math.pow(1.5, attempt - 1), 3000);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      try {
        const { jobs } = await this.fetchSchedulingData(true);
        const job = jobs.find(j => j.id === jobId);
        
        if (job && job.machineId === expectedMachineId) {
          return true;
        }
        
      } catch (error) {
        console.error(`❌ Error checking backend sync (attempt ${attempt}):`, error);
      }
    }
    
    console.warn(`⚠️ Backend sync timeout after ${maxAttempts} attempts`);
    return false;
  }

  private getDefaultPerformanceAnalytics(): PerformanceAnalytics {
    return {
      averageJobCompletionTime: 0,
      onTimeDeliveryRate: 0,
      machineUtilization: [],
      jobMetrics: [],
      metricsByTimePeriod: [],
      alerts: []
    };
  }

  private getDefaultRuleEngineDashboard(): RuleEngineDashboard {
    return {
      totalRules: 0,
      activeRules: 0,
      lastExecution: new Date().toISOString(),
      executionStats: { success: 0, warning: 0, error: 0 },
      recentExecutions: [],
      rules: [],
    };
  }

  private parseLocalDate(dateInput: string | Date | null | undefined): Date | null {
    if (!dateInput) return null;
    
    try {
      if (dateInput instanceof Date) {
        return isNaN(dateInput.getTime()) ? null : dateInput;
      }
      
     
      const dateStr = String(dateInput).trim();
      
      if (dateStr.includes('T')) {
        const parsed = new Date(dateStr);
        return isNaN(parsed.getTime()) ? null : parsed;
      }
      
      const parts = dateStr.split(/[-/]/);
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; 
        const day = parseInt(parts[2], 10);
        
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          const localDate = new Date(year, month, day);
          if (localDate.getFullYear() === year && 
              localDate.getMonth() === month && 
              localDate.getDate() === day) {
            return localDate;
          }
        }
      }
      
      const parsed = new Date(dateStr);
      return isNaN(parsed.getTime()) ? null : parsed;
    } catch (error) {
      console.error('❌ Error parsing date:', dateInput, error);
      return null;
    }
  }

  private async convertApiResponse(data: unknown): Promise<{
    jobs: Job[];
    machines: Machine[];
  }> {
    
    if (!data) {
      console.warn("⚠️ No data received from API");
      return { jobs: [], machines: [] };
    }

    let result: { jobs: Job[]; machines: Machine[] };

    if (Array.isArray(data)) {
      result = this.convertArrayResponse(data);
    } else if (typeof data === 'object' && data !== null && ('jobs' in data || 'machines' in data)) {
      result = this.convertObjectResponse(data as { machines?: ApiMachine[]; jobs?: ApiJob[] });
    } else {
      return { jobs: [], machines: [] };
    }

    try {
      const dependencies = await this.fetchJobDependencies();

      this.applyDependenciesToJobs(result.jobs, dependencies);
    } catch (error) {
      console.error('❌ Error fetching dependencies:', error);
    }

    this.calculateConflicts(result.jobs, result.machines);

    return result;
  }

  private applyDependenciesToJobs(jobs: Job[], dependencies: JobDependency[]): void {
    
    const jobMap = new Map<string, Job>();
    jobs.forEach(job => {
      const cleanId = job.id.replace(/^0+/, '') || '0';
      jobMap.set(cleanId, job);
      jobMap.set(job.id, job); 
    });

    const depsByJob = new Map<string, string[]>();
    
    dependencies.forEach(dep => {
      const cleanDependentJob = dep.DependentJob.replace(/^0+/, '') || '0';
      const cleanMasterJob = dep.MasterJob.replace(/^0+/, '') || '0';
      
      
      if (!depsByJob.has(cleanDependentJob)) {
        depsByJob.set(cleanDependentJob, []);
      }
      depsByJob.get(cleanDependentJob)!.push(cleanMasterJob);
    });

    let appliedCount = 0;
    depsByJob.forEach((masterJobs, dependentJobId) => {
      const job = jobMap.get(dependentJobId);
      if (job) {
        job.hasDependency = true;
        job.dependencies = masterJobs;
        appliedCount++;
      } else {
        console.warn(`⚠️ Job ${dependentJobId} not found in jobs list`);
      }
    });

  }

  private convertArrayResponse(data: ApiResponse): { jobs: Job[]; machines: Machine[] } {
    const jobs: Job[] = [];
    const machines: Machine[] = [];

    data.forEach((apiMachine, index) => {

      
      const capacityValue = typeof apiMachine.capacity === 'number' 
        ? apiMachine.capacity 
        : (typeof apiMachine.capacity === 'object' && apiMachine.capacity !== null 
          ? Object.values(apiMachine.capacity as Record<string, number>).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0) 
          : 9);
      const dailyCapacityValue: Record<string, number> = typeof apiMachine.capacity === 'object' && apiMachine.capacity !== null 
        ? apiMachine.capacity as Record<string, number>
        : { default: capacityValue };
      const machine: Machine = {
        id: apiMachine.machine || `machine-${index}`,
        name: apiMachine.machine || `Machine ${index}`,
        description: apiMachine.description || "",
        capacity: capacityValue,
        dailyCapacity: dailyCapacityValue,
      };
      machines.push(machine);

      if (apiMachine.jobs && Array.isArray(apiMachine.jobs)) {
        apiMachine.jobs.forEach((apiJob: ApiJob, jobIndex: number) => {
          
          const job: Job = {
            id: apiJob.JobId || `job-${index}-${jobIndex}`,
            name: apiJob.JobDescription || "Unnamed Job",
            description: apiJob.JobDescription || "",
            machineId: machine.id,
            startDate: apiJob.StartDate ? this.parseLocalDate(apiJob.StartDate) : null,
            endDate: apiJob.EndDate ? this.parseLocalDate(apiJob.EndDate) : null,
            status: this.mapApiStatus(apiJob.Status || ""),
            priority: this.mapApiPriority(apiJob.JobPriority || ""),
            jobType: apiJob.JobType || "",
            workOrderId: apiJob.JobId || "",
            conflictType: "none",
            hasDependency: false,
            materials: this.convertApiMaterials(apiJob.Materials || []),
            product: {
              id: apiJob.MasterStockCode || "",
              name: apiJob.MasterStockDescription || "",
              description: apiJob.MasterStockDescription || "",
              category: "Production",
            },
            masterStockCode: apiJob.MasterStockCode || "",
            masterStockDescription: apiJob.MasterStockDescription || "",
            masterStockInHand: apiJob.MasterStockInHand || 0,
            masterRemainingStockInHand: apiJob.MasterRemainingStockInHand || 0,
          };

          jobs.push(job);
        });
      }
    });

    return { jobs, machines };
  }

  private convertObjectResponse(data: { machines?: ApiMachine[]; jobs?: ApiJob[] }): { jobs: Job[]; machines: Machine[] } {
    const jobs: Job[] = [];
    const machines: Machine[] = [];
    if (data.machines && Array.isArray(data.machines)) {
      data.machines.forEach((apiMachine: ApiMachine, index: number) => {
      const capacityValue = typeof apiMachine.capacity === 'number' 
        ? apiMachine.capacity 
        : (typeof apiMachine.capacity === 'object' && apiMachine.capacity !== null 
          ? Object.values(apiMachine.capacity as Record<string, number>).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0) 
          : 9);
      const dailyCapacityValue: Record<string, number> = typeof apiMachine.capacity === 'object' && apiMachine.capacity !== null 
        ? apiMachine.capacity as Record<string, number>
        : { default: capacityValue };
      const machine: Machine = {
        id: apiMachine.machine || `machine-${index}`,
        name: apiMachine.machine || `Machine ${index}`,
        description: apiMachine.description || "",
        capacity: capacityValue,
        dailyCapacity: dailyCapacityValue,
      };
      machines.push(machine);
      });
    }
    if (data.jobs && Array.isArray(data.jobs)) {
      data.jobs.forEach((apiJob: ApiJob, index: number) => {
        const job: Job = {
          id: apiJob.JobId || `job-${index}`,
          name: apiJob.JobDescription || "Unnamed Job",
          description: apiJob.JobDescription || "",
          machineId: apiJob.MachineId || "",
          startDate: apiJob.StartDate ? this.parseLocalDate(apiJob.StartDate) : null,
          endDate: apiJob.EndDate ? this.parseLocalDate(apiJob.EndDate) : null,
          status: this.mapApiStatus(apiJob.Status || ""),
          priority: this.mapApiPriority(apiJob.JobPriority || ""),
          jobType: apiJob.JobType || "",
          workOrderId: apiJob.JobId || "",
          conflictType: "none",
          hasDependency: false,
          materials: this.convertApiMaterials(apiJob.Materials || []),
          product: {
            id: apiJob.MasterStockCode || "",
            name: apiJob.MasterStockDescription || "",
            description: apiJob.MasterStockDescription || "",
            category: "Production",
          },
          masterStockCode: apiJob.MasterStockCode || "",
          masterStockDescription: apiJob.MasterStockDescription || "",
          masterStockInHand: apiJob.MasterStockInHand || 0,
          masterRemainingStockInHand: apiJob.MasterRemainingStockInHand || 0,
        };

        jobs.push(job);
      });
    }

    return { jobs, machines };
  }

private convertApiMaterials(apiMaterials: ApiMaterial[]): Material[] {
    if (!apiMaterials || !Array.isArray(apiMaterials)) {
      return [];
    }

    return apiMaterials.map((apiMaterial, index) => {
      const getValue = (obj: ApiMaterial | Record<string, unknown>, keys: string[]): unknown => {
        for (const key of keys) {
          const value = (obj as Record<string, unknown>)[key];
          if (value !== undefined && value !== null) {
            return value;
          }
        }
        return undefined;
      };
      const qtyToMake = Number(getValue(apiMaterial, ['QtyToMake', 'qtyToMake']) ?? 0);
      const unitQtyReqd = Number(getValue(apiMaterial, ['UnitQtyReqd', 'unitQtyReqd']) ?? 0);
      const qtyIssued = Number(getValue(apiMaterial, ['QtyIssued', 'qtyIssued']) ?? 0);
      const qtyOnHand = Number(getValue(apiMaterial, ['QtyOnHand', 'qtyOnHand']) ?? 0);
      const qtyAllocated = Number(getValue(apiMaterial, ['QtyAllocated', 'qtyAllocated']) ?? 0);
      const jobMaterialRequired = Number(
        getValue(apiMaterial, ['JobMaterialRequired', 'jobMaterialRequired']) ?? 
        ((qtyToMake * unitQtyReqd) - qtyIssued)
      );
      
      const availableStock = Number(
        getValue(apiMaterial, ['AvailableStock', 'availableStock']) ?? 
        (qtyOnHand - qtyAllocated)
      );

      const stockInHand = Number(getValue(apiMaterial, ['StockInHand', 'stockInHand']) ?? 0);

      return {
        id: String(getValue(apiMaterial, ['StockCode', 'stockCode']) ?? ''),
        name: String(getValue(apiMaterial, ['StockDescription', 'stockDescription']) ?? 'Unknown Material'),
        required: unitQtyReqd,
        available: stockInHand,
        unit: "pcs",
        status: this.calculateMaterialStatus(stockInHand, unitQtyReqd),
        cost: Number(getValue(apiMaterial, ['UnitCost', 'unitCost']) ?? 0),
        stockCode: String(getValue(apiMaterial, ['StockCode', 'stockCode']) ?? ''),
        stockDescription: String(getValue(apiMaterial, ['StockDescription', 'stockDescription']) ?? ''),
        unitQtyReqd: unitQtyReqd,
        unitCost: Number(getValue(apiMaterial, ['UnitCost', 'unitCost']) ?? 0),
        stockInHand: stockInHand,
        remainingStockInHand: Number(getValue(apiMaterial, ['RemainingStockInHand', 'remainingStockInHand']) ?? 0),
        qtyIssued: qtyIssued,
        qtyToMake: qtyToMake,
        qtyOnHand: qtyOnHand,
        qtyAllocated: qtyAllocated,
        jobMaterialRequired: jobMaterialRequired,
        availableStock: availableStock,
      };
    });
  }

  private mapApiStatus(
    apiStatus: string
  ): "Active" | "Completed" | "OnHold" | "In Progress" {
    if (!apiStatus) return "Active";
    
    switch (apiStatus.toLowerCase()) {
      case "completed":
        return "Completed";
      case "in progress":
        return "In Progress";
      case "on hold":
      case "delayed":
        return "OnHold";
      default:
        return "Active";
    }
  }

  private mapApiPriority(
    apiPriority: string
  ): "low" | "medium" | "high" | "critical" {
    if (!apiPriority) return "medium";
    
    switch (apiPriority.toLowerCase()) {
      case "high":
        return "high";
      case "critical":
        return "critical";
      case "low":
        return "low";
      default:
        return "medium";
    }
  }

  private calculateMaterialStatus(
    stockInHand: number,
    unitQtyReqd: number
  ): "available" | "low" | "critical" | "unavailable" {
    if (stockInHand === 0) return "unavailable";
    if (unitQtyReqd === 0) return "available";
    if (stockInHand < unitQtyReqd * 0.2) return "critical";
    if (stockInHand < unitQtyReqd * 0.5) return "low";
    return "available";
  }

  private calculateConflicts(jobs: Job[], machines: Machine[]): void {
    jobs.forEach((job) => {
      const machine = machines.find((m) => m.id === job.machineId);
      if (!machine) return;

      if (!job.startDate || !job.endDate) return;

      const jobStart = new Date(job.startDate);
      const jobEnd = new Date(job.endDate);

      const overlappingJobs = jobs.filter(
        (otherJob) =>
          otherJob.id !== job.id &&
          otherJob.machineId === job.machineId &&
          otherJob.startDate &&
          otherJob.endDate &&
          new Date(otherJob.startDate) < jobEnd &&
          new Date(otherJob.endDate) > jobStart
      );

      if (overlappingJobs.length > 0) {
        job.conflictType = "capacity";
        job.conflictDetails = {
          reason: `Overlaps with ${overlappingJobs.length} other job(s)`,
          recommendation: "Reschedule to avoid conflicts",
        };
      }

      const materialConflicts = job.materials?.filter(
        (material) =>
          material.status === "critical" || material.status === "unavailable"
      );

      if (materialConflicts && materialConflicts.length > 0) {
        job.conflictType = "material";
        job.conflictDetails = {
          reason: `Insufficient materials: ${materialConflicts
            .map((m) => m.name)
            .join(", ")}`,
          recommendation: "Order additional materials or reschedule",
        };
      }
    });
  }
}

export const apiService = new ApiService();
export { ApiService };