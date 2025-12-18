import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiService } from '@/services/api';
import { JobDetailsModal } from './JobDetailsModal';
import { Machine, FilterOptions, ApiJob } from '../../types/jobs';

interface CardViewProps {
  jobs?: ApiJob[];
  machines?: Machine[];
  filters?: FilterOptions;
}

export const CardView = ({
  jobs: initialJobs,
  machines: initialMachines,
  filters = {
    machine: null,
    status: null,
    material: null,
    search: '',
    crewSkill: null,
    job: null,
    product: null,
  },
}: CardViewProps) => {
  const [allJobs, setAllJobs] = useState<ApiJob[]>([]);
  const [dashboardData, setDashboardData] = useState<ApiJob[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<ApiJob | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = (jobData: ApiJob) => {
    setSelectedJob(jobData);
    setIsModalOpen(true);
  };

  useEffect(() => {
  const fetchDashboardData = async () => {
  try {
    const rawData: ApiJob[] = await apiService.fetchJobDashboard();

    // Make sure data is consistent
    const mappedData: ApiJob[] = rawData.map((job: any) => ({
      JobId: job.JobId ?? job.job ?? '',
      JobDescription: job.JobDescription ?? job.jobDescription ?? '',
      MachineId: job.MachineId ?? job.machine ?? '',
      MachineDescription: job.MachineDescription ?? job.machine ?? '',
      StartDate: job.StartDate ?? job.jobStartDate ?? null,
      EndDate: job.EndDate ?? job.jobEndDate ?? null,
      Status: job.Status ?? job.jobStatus ?? null,
      JobPriority: job.JobPriority ?? job.jobPriority ?? null,
      JobType: job.JobType ?? job.jobType ?? null,
      MasterStockCode: job.MasterStockCode ?? job.masterStockCode ?? '',
      MasterStockDescription: job.MasterStockDescription ?? job.masterStockDescription ?? '',
      CrewSkill: job.CrewSkill ?? job.crewSkill ?? null,
      Material: job.Material ?? job.material ?? null,
    }));

    // Ensure uniqueness by JobId
    const uniqueData = mappedData.filter(
      (job, index, self) =>
        index === self.findIndex((j) => j.JobId === job.JobId)
    );

    setAllJobs(uniqueData);
    setDashboardData(uniqueData);
  } catch (err) {
    console.error('Error in fetchDashboardData:', err);
    setError('Failed to load dashboard data. Please try again later.');
  } finally {
    setIsLoading(false);
  }
};
    fetchDashboardData();
  }, []);

  // 🔎 Apply filters whenever they change
  useEffect(() => {
    if (!filters || Object.keys(filters).length === 0) {
      setDashboardData(allJobs);
      return;
    }

    let filtered = [...allJobs];

    if (filters.machine) {
      filtered = filtered.filter(
        (job) => job.MachineId === String(filters.machine)
      );
    }
    if (filters.status) {
      filtered = filtered.filter(
        (job) => job.Status === String(filters.status)
      );
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.JobDescription?.toLowerCase().includes(searchLower) ||
          job.JobId?.toLowerCase().includes(searchLower) ||
          job.MachineId?.toLowerCase().includes(searchLower) ||
          job.MachineDescription?.toLowerCase().includes(searchLower) ||
          job.Status?.toLowerCase().includes(searchLower)
      );
    }
    if (filters.job) {
      filtered = filtered.filter(
        (job) =>
          job.JobDescription === String(filters.job) ||
          job.JobId === String(filters.job)
      );
    }
    if (filters.product) {
      const productLower = String(filters.product).toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.JobDescription?.toLowerCase().includes(productLower) ||
          job.JobId?.toLowerCase().includes(productLower)
      );
    }

    setDashboardData(filtered);
  }, [filters, allJobs]);

  const getStatusBadge = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-800';

    switch (status.toLowerCase()) {
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'delayed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading Data...</span>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (dashboardData.length === 0) {
    return (
      <div className="p-4 text-muted-foreground">
        {filters ? 'No jobs match your filters.' : 'No jobs found in the dashboard.'}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div
        className="flex-1 overflow-y-auto p-4"
        style={{
          maxHeight: 'calc(100vh - 100px)',
          minHeight: '400px',
        }}
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-min">
          {dashboardData.map((item) => (
            <Card
              key={item.JobId}
              className="hover:shadow-lg transition-shadow h-full flex flex-col cursor-pointer"
              onClick={() => handleCardClick(item)}
            >
              <CardHeader className="pb-2">
                <CardTitle
                  className="text-lg line-clamp-2"
                  title={item.JobDescription}
                >
                  {item.JobDescription || `Job ${item.JobId}`}
                </CardTitle>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    {item.MachineDescription || item.MachineId || 'Unknown'}
                  </span>
                  <span
                    className={cn(
                      'text-xs px-2 py-1 rounded-full whitespace-nowrap',
                      getStatusBadge(item.Status)
                    )}
                  >
                    {item.Status || 'Unknown'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm truncate">
                      {item.MachineId || 'Unassigned'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <JobDetailsModal
        job={selectedJob}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};