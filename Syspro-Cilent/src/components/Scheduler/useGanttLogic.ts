import { useState, useEffect, useRef } from 'react';
import { Job, Machine, FilterOptions } from '@/types/jobs';
import { parseISO, isBefore, format, addDays } from 'date-fns';
import { apiService } from "@/services/api";
import { toast } from 'sonner';

interface UseGanttLogicProps {
  jobs: Job[];
  machines: Machine[];
  onJobUpdate?: (updatedJob: Job) => Promise<Job | undefined>;
}

interface DropInfo {
  job: Job;
  newMachineId: string;
  newStartDate: Date;
}

const extractErrorMessage = (error: unknown): string => {
  let errStr = '';
  if (error instanceof Error) {
    errStr = error.message;
  } else if (typeof error === 'string') {
    errStr = error;
  } else if (error && typeof error === 'object') {
    const e = error as any;
    if (e.Message) return e.Message;
    if (e.message) return e.message;
    if (e.error) return e.error;
    errStr = JSON.stringify(error);
  } else {
    return 'An unknown error occurred';
  }

  const jsonMatch = errStr.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.Message) return parsed.Message;
      if (parsed.message) return parsed.message;
      if (parsed.error) return parsed.error;
    } catch {
      //empty
    }
  }

  let cleanMsg = errStr
    .replace(/^(External API error:|Client error \d+:|Server error:|Bad request:|Error:|Errors occurred[:.]?\s*)/i, '')
    .trim();
  cleanMsg = cleanMsg.replace(/^Errors?\s*Occurr?ed\s*[:.]?\s*/i, '').trim();

  if (!cleanMsg || cleanMsg.toLowerCase().includes('unknown error')) {
    return 'Job move failed due to validation error';
  }

  return cleanMsg;
};

export const useGanttLogic = ({ jobs, machines, onJobUpdate }: UseGanttLogicProps) => {
  const [cellWidth, setCellWidth] = useState<number>(100);
  const [draggingJob, setDraggingJob] = useState<Job | null>(null);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(jobs);
  const [pendingDrop, setPendingDrop] = useState<DropInfo | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  
  const confirmedUpdatesRef = useRef<Map<string, {
    jobId: string;
    machineId: string;
    startDate: Date;
    endDate: Date;
  }>>(new Map());

  useEffect(() => {
    if (pendingDrop) {
      return;
    }

    if (confirmedUpdatesRef.current.size > 0) {
      const mergedJobs = jobs.map(job => {
        const confirmedUpdate = confirmedUpdatesRef.current.get(job.id);
        
        if (confirmedUpdate) {
          const backendStart = job.startDate instanceof Date 
            ? job.startDate 
            : (job.startDate ? new Date(job.startDate) : null);
          
          const backendDateMatches = backendStart && 
            backendStart.getFullYear() === confirmedUpdate.startDate.getFullYear() &&
            backendStart.getMonth() === confirmedUpdate.startDate.getMonth() &&
            backendStart.getDate() === confirmedUpdate.startDate.getDate();
          
          const machineMatches = job.machineId === confirmedUpdate.machineId;
          
          if (backendDateMatches && machineMatches) {
            confirmedUpdatesRef.current.delete(job.id);
            return job; 
          }
          
          return {
            ...job,
            machineId: confirmedUpdate.machineId,
            startDate: confirmedUpdate.startDate,
            endDate: confirmedUpdate.endDate
          };
        }
        
        return job;
      });
      
      setFilteredJobs(mergedJobs);
    } else {
      setFilteredJobs(jobs);
    }
  }, [jobs, pendingDrop]);

  // ----------------- FILTERING -----------------
  const applyFilters = (filters?: FilterOptions) => {
    let result = [...jobs];

    if (!filters) return setFilteredJobs(result);

    if (filters.machine) result = result.filter(j => j.machineId === filters.machine);
    if (filters.status) result = result.filter(j => j.status === filters.status);
    if (filters.material) {
      result = result.filter(j => j.materials?.some(m => m.id === filters.material || m.name === filters.material));
    }
    if (filters.crewSkill) {
      if (filters.crewSkill.startsWith('crew:')) {
        const crewName = filters.crewSkill.slice(5);
        result = result.filter(j => j.crewName === crewName);
      } else if (filters.crewSkill.startsWith('skill:')) {
        const skill = filters.crewSkill.slice(6);
        result = result.filter(j => j.skillLevel === skill);
      }
    }
    if (filters.job) result = result.filter(j => j.jobType === filters.job || j.name === filters.job);
    if (filters.product) result = result.filter(j => j.product?.category === filters.product);

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(j => {
        const jobMatch = j.name.toLowerCase().includes(searchLower) ||
          j.id.toString().toLowerCase().includes(searchLower) ||
          j.description?.toLowerCase().includes(searchLower);
        const machineMatch = machines.find(m => m.id === j.machineId)?.name.toLowerCase().includes(searchLower);
        const materialMatch = j.materials?.some(m => m.name?.toLowerCase().includes(searchLower) || m.id?.toLowerCase().includes(searchLower));
        const crewMatch = j.crewName?.toLowerCase().includes(searchLower);
        const skillMatch = j.skillLevel?.toLowerCase().includes(searchLower);
        const productMatch = j.product?.category?.toLowerCase().includes(searchLower);
        const jobTypeMatch = j.jobType?.toLowerCase().includes(searchLower);
        const conflictMatch = j.conflictDetails?.reason?.toLowerCase().includes(searchLower) ||
          j.conflictDetails?.recommendation?.toLowerCase().includes(searchLower);

        return jobMatch || machineMatch || materialMatch || crewMatch || skillMatch || productMatch || jobTypeMatch || conflictMatch;
      });
    }

    setFilteredJobs(result);
  };

  // ----------------- DRAG & DROP -----------------
  const handleDragStart = (jobId: string, e: React.DragEvent<HTMLDivElement>) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) {
      console.error('❌ Job not found for drag start:', jobId);
      toast.error('Job not found');
      return;
    }
    
    setDraggingJob(job);
    
    const dragData = {
      jobId: job.id,
      sourceMachineId: job.machineId,
      originalStartDate: job.startDate,
      originalEndDate: job.endDate,
      jobName: job.name
    };
    
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, newMachineId: string, newStartDate: Date) => {
    e.preventDefault();
    
    try {
      const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
      const jobId = dragData.jobId;
      
      const job = filteredJobs.find(j => j.id === jobId) || jobs.find(j => j.id === jobId);
      
      if (!job) {
        console.error('❌ Job not found in drop handler:', jobId);
        toast.error('Job not found');
        return;
      }

      const validation = validateJobMove(job, newMachineId, newStartDate);
      
      if (!validation.valid) {
        console.warn('❌ Invalid move:', validation.message);
        toast.error(`Cannot move job: ${validation.message}`);
        setDraggingJob(null);
        return;
      }

      let jobDuration = 1;
      if (job.startDate && job.endDate) {
        const originalStart = job.startDate instanceof Date ? job.startDate : new Date(job.startDate);
        const originalEnd = job.endDate instanceof Date ? job.endDate : new Date(job.endDate);
        
        if (!isNaN(originalStart.getTime()) && !isNaN(originalEnd.getTime())) {
          jobDuration = Math.max(1, Math.ceil((originalEnd.getTime() - originalStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);
        }
      }
      
      const newEndDate = addDays(newStartDate, jobDuration - 1);

      const temporaryUpdatedJob: Job = {
        ...job,
        startDate: newStartDate,
        endDate: newEndDate,
        machineId: newMachineId,
      };

      setFilteredJobs(prev => prev.map(j => j.id === job.id ? temporaryUpdatedJob : j));

      setPendingDrop({
        job, 
        newMachineId,
        newStartDate
      });
      setDraggingJob(null);
      
    } catch (error) {
      console.error('❌ Drop error:', error);
      toast.error('Failed to process job move');
      setDraggingJob(null);
    }
  };

  const confirmMove = async (): Promise<{ success: boolean; job?: Job; error?: string }> => {
    if (!pendingDrop) {
      return { success: false, error: "No pending drop" };
    }

    const { job, newMachineId, newStartDate } = pendingDrop;

    setIsUpdating(true);

    try {
      let jobDuration = 1;
      if (job.startDate && job.endDate) {
        const originalStart = job.startDate instanceof Date ? job.startDate : new Date(job.startDate);
        const originalEnd = job.endDate instanceof Date ? job.endDate : new Date(job.endDate);
        
        if (!isNaN(originalStart.getTime()) && !isNaN(originalEnd.getTime())) {
          jobDuration = Math.max(1, Math.ceil((originalEnd.getTime() - originalStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);
        }
      }

      const newEndDate = addDays(newStartDate, jobDuration - 1);

      const updatedJobPayload: Job = {
        ...job,
        startDate: newStartDate,
        endDate: newEndDate,
        machineId: newMachineId,
      };

      const apiResult = await apiService.updateJob(job.id, updatedJobPayload);

      if (!apiResult) {
        throw new Error("API update failed - no response");
      }

      confirmedUpdatesRef.current.set(job.id, {
        jobId: job.id,
        machineId: newMachineId,
        startDate: newStartDate,
        endDate: newEndDate
      });

      const confirmedJob: Job = {
        ...job,
        startDate: newStartDate,
        endDate: newEndDate,
        machineId: newMachineId,
      };

      setFilteredJobs(prev => prev.map(j => j.id === job.id ? confirmedJob : j));

      setPendingDrop(null);

      if (onJobUpdate) {
        try {
          await onJobUpdate(confirmedJob);
        } catch (parentError) {
          console.warn("⚠️ Parent onJobUpdate failed:", parentError);
        }
      }

      return { 
        success: true, 
        job: confirmedJob 
      };
      
    } catch (error) {
      console.error('❌ Error confirming move:', error);
      
      setFilteredJobs(prev => prev.map(j => j.id === job.id ? job : j));
      
      // Extract clean error message
      const errorMessage = extractErrorMessage(error);
      
      setPendingDrop(null);
      confirmedUpdatesRef.current.delete(job.id); 
      setIsUpdating(false);
      
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setIsUpdating(false);
    }
  };

  const cancelMove = () => {
    if (pendingDrop) {
      setFilteredJobs(prev => prev.map(j => j.id === pendingDrop.job.id ? pendingDrop.job : j));
    }
    
    setPendingDrop(null);
    confirmedUpdatesRef.current.delete(pendingDrop?.job.id || ''); 
  };

  const clearConfirmedUpdate = (jobId: string) => {
    confirmedUpdatesRef.current.delete(jobId);
  };

  // ----------------- VALIDATE JOB MOVE -----------------
  const validateJobMove = (job: Job, newMachineId: string, newStartDate: Date) => {
    if (!job || !newMachineId || !newStartDate) {
      return {
        valid: false,
        message: "Missing required move information",
        conflictType: 'validation' as const,
      };
    }

    if (isNaN(newStartDate.getTime())) {
      return {
        valid: false,
        message: "Invalid target date",
        conflictType: 'validation' as const,
      };
    }

    if (job.hasDependency && job.dependencies?.length) {
      const depJobs = jobs.filter(j => job.dependencies?.includes(j.id));
      for (const dep of depJobs) {
        if (!dep.endDate) continue;
        
        const depEnd = dep.endDate instanceof Date ? dep.endDate : parseISO(dep.endDate as unknown as string);
        if (isBefore(newStartDate, depEnd)) {
          return {
            valid: false,
            message: `Job depends on ${dep.name} which ends on ${format(depEnd, 'MMM d')}`,
            conflictType: 'dependency' as const,
          };
        }
      }
    }

    const machineJobs = jobs.filter(j => j.machineId === newMachineId && j.id !== job.id);
    const targetMachine = machines.find(m => m.id === newMachineId);
    
    if (!targetMachine) {
      return { 
        valid: false, 
        message: 'Target machine not found',
        conflictType: 'validation' as const,
      };
    }

    let jobDuration = 1;
    if (job.startDate && job.endDate) {
      const originalStart = job.startDate instanceof Date ? job.startDate : new Date(job.startDate);
      const originalEnd = job.endDate instanceof Date ? job.endDate : new Date(job.endDate);
      if (!isNaN(originalStart.getTime()) && !isNaN(originalEnd.getTime())) {
        jobDuration = Math.max(1, Math.ceil((originalEnd.getTime() - originalStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      }
    }
    
    const newEndDate = addDays(newStartDate, jobDuration - 1);
    
    const overlappingJobs = machineJobs.filter(otherJob => {
      if (!otherJob.startDate || !otherJob.endDate) return false;
      
      const otherStart = otherJob.startDate instanceof Date ? otherJob.startDate : new Date(otherJob.startDate);
      const otherEnd = otherJob.endDate instanceof Date ? otherJob.endDate : new Date(otherJob.endDate);
      
      return newStartDate < otherEnd && newEndDate > otherStart;
    });

    if (overlappingJobs.length > 0) {
      return {
        valid: false,
        message: `Overlaps with ${overlappingJobs.length} existing job(s) on ${targetMachine.name}`,
        conflictType: 'capacity' as const,
      };
    }

    return { valid: true };
  };

  return {
    cellWidth,
    setCellWidth,
    draggingJob,
    filteredJobs,
    pendingDrop,
    isUpdating,
    applyFilters,
    handleDragStart,
    handleDragOver,
    handleDrop,
    confirmMove,
    cancelMove,
    validateJobMove,
  };
};