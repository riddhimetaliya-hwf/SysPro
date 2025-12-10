import React, { useState, useEffect } from 'react';
import { Job, Material } from '../../types/jobs';
import { format } from 'date-fns';
import { AlertTriangle, Clock, Package, Lightbulb, Calendar, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../UI/dialog';
import { stripLeadingZeros } from '@/lib/utils';
import { apiService } from '@/services/api';
import type { JobDependency } from '@/types/jobs';

interface JobDetailsModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ApiJobFormat {
  JobId?: string;
  JobDescription?: string;
  MachineId?: string;
  StartDate?: Date | string;
  EndDate?: Date | string;
  Status?: string;
  Dependencies?: string[];
  HasDependency?: boolean;
  Materials?: Material[];
}

export const JobDetailsModal = ({ job, isOpen, onClose }: JobDetailsModalProps) => {
  const [dependentJobs, setDependentJobs] = useState<string[]>([]);
  const [isLoadingDependencies, setIsLoadingDependencies] = useState(false);

  useEffect(() => {
    if (!isOpen || !job) {
      setDependentJobs([]);
      return;
    }

    const fetchDependencies = async () => {
      setIsLoadingDependencies(true);
      try {
        const dependencies = await apiService.fetchJobDependencies(job.id);
        const dependentJobIds = dependencies.map(dep => stripLeadingZeros(dep.DependentJob));
        setDependentJobs(dependentJobIds);
      } catch (error) {
        console.error('❌ Error fetching dependencies:', error);
        setDependentJobs([]);
      } finally {
        setIsLoadingDependencies(false);
      }
    };

    fetchDependencies();
  }, [job?.id, isOpen]);

  if (!job) return null;

  const apiJob = job as Job & Partial<ApiJobFormat>;
  const normalizedJob = {
    id: job.id ?? apiJob.JobId ?? '',
    name: job.name ?? apiJob.JobDescription ?? '',
    description: job.description ?? apiJob.JobDescription ?? '',
    machineId: job.machineId ?? apiJob.MachineId ?? '',
    startDate: job.startDate ?? apiJob.StartDate ?? null,
    endDate: job.endDate ?? apiJob.EndDate ?? null,
    status: job.status ?? apiJob.Status ?? undefined,
    conflictType: job.conflictType ?? 'none',
    conflictDetails: job.conflictDetails ?? null,
    materials: job.materials ?? apiJob.Materials ?? []
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return 'Not scheduled';
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) return 'Invalid date';
      return format(dateObj, 'MMM d, yyyy HH:mm');
    } catch (error) {
      return 'Date error';
    }
  };

  const getConflictDetails = () => {
    if (normalizedJob.conflictType === 'none') return null;

    const conflictInfo = {
      capacity: {
        icon: <AlertTriangle size={20} className="text-red-500" />,
        title: 'Machine/Resource Overload',
        description: 'Machine capacity exceeded during this time slot',
        resolution: 'Reschedule to adjacent time slot or use alternative machine',
        severity: 'High',
        color: 'border-red-200 bg-red-50'
      },
      material: {
        icon: <Package size={20} className="text-orange-500" />,
        title: 'Material Shortage',
        description: normalizedJob.conflictDetails?.reason || 'Required materials unavailable',
        resolution: 'Contact procurement or delay job until materials arrive',
        severity: 'Medium',
        color: 'border-orange-200 bg-orange-50'
      },
      resource: {
        icon: <Clock size={20} className="text-yellow-600" />,
        title: 'Resource Conflict',
        description: 'Required resources are allocated elsewhere',
        resolution: 'Coordinate with resource manager or adjust timing',
        severity: 'Medium',
        color: 'border-yellow-200 bg-yellow-50'
      }
    };

    return conflictInfo[normalizedJob.conflictType as keyof typeof conflictInfo];
  };

  const conflictDetails = getConflictDetails();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {normalizedJob.name}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                Job ID: {stripLeadingZeros(normalizedJob.id)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-gray-900 mt-1">{normalizedJob.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <p className="text-gray-900 mt-1 capitalize">{normalizedJob.status || 'Scheduled'}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Machine</label>
                <p className="text-gray-900 mt-1">{normalizedJob.machineId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Priority</label>
                <p className="text-gray-900 mt-1">Normal</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Calendar size={16} />
              Schedule Timeline
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Start Date</label>
                <p className="text-gray-900 mt-1">{formatDate(normalizedJob.startDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">End Date</label>
                <p className="text-gray-900 mt-1">{formatDate(normalizedJob.endDate)}</p>
              </div>
            </div>
          </div>

          {/* Conflict Info */}
          {conflictDetails && (
            <div className={`border rounded-lg p-4 ${conflictDetails.color}`}>
              <div className="flex items-center gap-3 mb-3">
                {conflictDetails.icon}
                <div>
                  <h3 className="font-medium text-gray-900">{conflictDetails.title}</h3>
                  <p className="text-sm text-gray-700">{conflictDetails.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* 🌟 UNIFIED JOB DEPENDENCIES SECTION */}
          <div className="border rounded-lg p-4 bg-blue-50">
            <h3 className="font-medium text-gray-900 mb-3">Job Dependencies</h3>

            {isLoadingDependencies ? (
              <div className="p-2 bg-white rounded border flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <p className="text-sm text-gray-600">Loading...</p>
              </div>
            ) : dependentJobs.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-2 bg-white rounded border">
                {dependentJobs.map((dep) => (
                  <span
                    key={dep}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                  >
                    {dep}
                  </span>
                ))}
              </div>
            ) : (
              <div className="p-2 bg-white rounded border">
                <p className="text-sm text-gray-500">No Job Dependencies</p>
              </div>
            )}
          </div>

          {/* Materials */}
          {normalizedJob.materials && normalizedJob.materials.length > 0 && (
            <div className="border rounded-lg p-4 bg-green-50">
              <h3 className="font-medium text-gray-900 mb-3">Materials Required</h3>
              <div className="space-y-2">
                {normalizedJob.materials.map((material: Material, index: number) => {
                  const materialData = material as Material & {
                    jobMaterialRequired?: number;
                    JobMaterialRequired?: number;
                    availableStock?: number;
                    AvailableStock?: number;
                  };

                  const required = Number(materialData.jobMaterialRequired ?? materialData.JobMaterialRequired ?? 0);
                  const available = Number(materialData.availableStock ?? materialData.AvailableStock ?? 0);
                  const isShortage = available < required;

                  return (
                    <div key={material.id || index} className="flex items-center justify-between p-2 bg-white rounded border">
                      <span className="text-gray-900">{material.name}</span>
                      <div className="text-right">
                        <span className={`text-sm font-semibold ${isShortage ? 'text-red-600' : 'text-green-600'}`}>
                          {available}/{required} units
                        </span>
                        <p className="text-xs text-gray-500">{isShortage ? 'Shortage' : 'Available'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
