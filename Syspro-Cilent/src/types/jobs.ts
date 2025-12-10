// API Response Types
export interface ApiJob {
  JobId: string;
  JobDescription: string;
  MachineId: string;
  MachineDescription: string;
  JobPriority: string;
  StartDate: string;
  EndDate: string;
  JobType: string;
  Status: string;
  MasterStockCode: string;
  MasterStockDescription: string;
  MasterStockInHand: number;
  MasterRemainingStockInHand: number;
  Materials: ApiMaterial[];
}

export interface ApiMaterial {
  StockCode: string;
  StockDescription: string;
  UnitQtyReqd: number;
  UnitCost: number;
  StockInHand: number;
  RemainingStockInHand: number;
  QtyIssued: number;
  QtyToMake: number;
  JobMaterialRequired: number;  // NEW
  QtyOnHand: number;            // NEW
  QtyAllocated: number;         // NEW
  AvailableStock: number;       // NEW
}

export interface ApiMachine {
  machine: string;
  description: string;
  capacity: Record<string, number>;
  jobs: ApiJob[];
}

export type ApiResponse = ApiMachine[];

// 📌 New: Job Dashboard API response
export interface JobDashboardItem {
  job: string;
  jobDescription: string;
  machine: string;
  jobStartDate: string;
  jobEndDate: string;
  jobStatus: string;
}

export type JobDashboardResponse = JobDashboardItem[];

// 📌 NEW: Job Conflict API response
export interface JobConflict {
  job: string;
  jobDescription: string;
  machine: string;
  impactScore: number;
  urgency: string;
  complexity: string;
  conflictReason: string;
}

export type JobConflictResponse = JobConflict[];

// Frontend Types (converted from API)
export interface Job {
  id: string; // Using JobId from API
  name: string;
  description: string;
  machineId: string;
  startDate: Date | null;
  endDate: Date | null;
  conflictType: 'none' | 'capacity' | 'material' | 'resource';
  conflictDetails?: {
    reason: string;
    recommendation?: string;
  };
  hasDependency: boolean;
  dependencies?: string[]; // Using string IDs to match API
  materials?: Material[]; // Bill of materials
  product?: Product; // End product of the job
  status?: 'Active' | 'Completed' | 'OnHold' | 'In Progress' | 'Pending';
  crewName?: string;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  jobType?: string;
  workOrderId?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  masterStockCode?: string;
  masterStockDescription?: string;
  masterStockInHand?: number;
  masterRemainingStockInHand?: number;
}

export interface Material {
  id: string;
  name: string;
  required: number;
  available: number;
  unit: string;
  status: "available" | "low" | "critical" | "unavailable";
  cost?: number;
  stockCode?: string;
  stockDescription?: string;
  unitQtyReqd?: number;
  unitCost?: number;
  stockInHand?: number;
  remainingStockInHand?: number;
  jobMaterialRequired?: number;  
  availableStock?: number;      
  qtyIssued?: number;            
  qtyToMake?: number;            
  qtyOnHand?: number;            
  qtyAllocated?: number;      
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  specifications?: Record<string, unknown>;
}

export interface Machine {
  id: string;
  name: string;
  description: string;
  capacity: number;
  dailyCapacity?: Record<string, number>;
}

export interface GanttConfig {
  timeHorizon: number;
  detectCapacityConflicts: boolean;
  detectMaterialConflicts: boolean;
  enforceDependencies: boolean;
  dayStartHour: number;
  dayEndHour: number;
}

export interface FilterOptions {
  machine: string | null;
  status: string | null;
  material: string | null;
  search: string;
  crewSkill: string | null;
  job: string | null;
  product: string | null;
}

export interface SmartAlert {
  id: string;
  type: 'overbooked' | 'overlap' | 'material' | 'resource' | string;
  severity: 'critical' | 'warning' | string;
  title: string;
  description: string;
  jobId: string;
  suggestion: string;
  autoResolvable: boolean;
  resolved?: boolean;
  timestamp?: string;
  source?: string;
}

export interface SchedulingRule {
  id: string;
  ruleName: string;
  jobDescription?: string;
  condition: string;
  action: string;
  priority: number;
  isActive: boolean;
  lastTriggered?: string;
  createdAt: string;
  updatedAt: string;
  appliedCount?: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  AccessToken: string;
}

export interface JobUpdateRequest {
  jobId: string;
  machineId: string;
  startDate: string;
  endDate: string;
  name: string;
  description: string;
  conflictType: 'none' | 'capacity' | 'material' | 'resource';
  conflictDetails?: {
    reason: string;
    recommendation?: string;
  };
  hasDependency: boolean;
  dependencies?: string[]; 
  materials?: Material[]; 
  product?: Product; 
  status?: 'Active' | 'Completed' | 'OnHold' | 'In Progress' | 'Pending';
  crewName?: string;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  jobType?: string;
  workOrderId?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  masterStockCode?: string;
  masterStockDescription?: string;
  masterStockInHand?: number;
  masterRemainingStockInHand?: number;
}
export interface JobDependency {
  DependentJob: string;
  DependentDescription: string;
  JobType: string;
  MasterJob: string;
}