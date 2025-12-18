import React, { useEffect, useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/UI/select';
import { Input } from '@/components/ui/input';
import { Job } from '@/types/jobs';
import { Filter, Search, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/UI/tooltip';
import { apiService } from '@/services/api';
import { useFilters } from '@/contexts/FilterContext';

export const JobFilters = () => {
  const { filters, setFilters } = useFilters();
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [searchedJobs, setSearchedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [allProducts, setAllProducts] = useState<string[]>([]);

  // Fetch jobs on mount
  useEffect(() => {
    setLoading(true);
    apiService.fetchJobs()
      .then((fetched) => setAllJobs(fetched ?? []))
      .finally(() => setLoading(false));
  }, []);

  // Fetch products on mount
  useEffect(() => {
    apiService.fetchProducts().then((fetched) => setAllProducts(fetched ?? []));
  }, []);

  // Smart search
  useEffect(() => {
    if (!filters?.search) {
      setSearchedJobs([]);
      return;
    }

    const handler = setTimeout(() => {
      const searchLower = filters.search.toLowerCase();
      const filtered = allJobs.filter(job =>
        job.name?.toLowerCase().includes(searchLower) ||
        job.id?.toString().toLowerCase().includes(searchLower) ||
        job.description?.toLowerCase().includes(searchLower) ||
        job.machineId?.toLowerCase().includes(searchLower) ||
        job.materials?.some(m => m.name?.toLowerCase().includes(searchLower)) ||
        job.crewName?.toLowerCase().includes(searchLower) ||
        job.skillLevel?.toLowerCase().includes(searchLower) ||
        job.product?.category?.toLowerCase().includes(searchLower) ||
        job.jobType?.toLowerCase().includes(searchLower)
      );
      setSearchedJobs(filtered);
    }, 400);

    return () => clearTimeout(handler);
  }, [filters?.search, allJobs]);

  // Jobs displayed in table
  const jobsToShow = filters?.search ? searchedJobs : allJobs;

  // Dropdown options should always come from allJobs
  const sourceJobs = allJobs;

  const allMachines = React.useMemo(() => {
    const machines = new Set<string>();
    sourceJobs.forEach(job => job.machineId && machines.add(job.machineId));
    return Array.from(machines);
  }, [sourceJobs]);

  const allMaterials = React.useMemo(() => {
    const materials = new Set<string>();
    sourceJobs.forEach(job =>
      job.materials?.forEach(material => material?.name && materials.add(material.name))
    );
    return Array.from(materials);
  }, [sourceJobs]);

  const allCrewSkills = React.useMemo(() => {
    const crewSkills = new Set<string>();
    sourceJobs.forEach(job => {
      if (job.crewName) crewSkills.add(`crew:${job.crewName}`);
      if (job.skillLevel) crewSkills.add(`skill:${job.skillLevel}`);
    });
    return Array.from(crewSkills);
  }, [sourceJobs]);

  const allJobTypes = React.useMemo(() => {
    const jobTypes = new Set<string>();
    sourceJobs.forEach(job => {
      if (job.jobType) jobTypes.add(job.jobType);
      if (job.name) jobTypes.add(job.name);
    });
    return Array.from(jobTypes);
  }, [sourceJobs]);

  const allProductTypes = React.useMemo(() => {
    const productTypes = new Set<string>();
    sourceJobs.forEach(job => job.product?.category && productTypes.add(job.product.category));
    allProducts.forEach(p => productTypes.add(p)); // include from API
    return Array.from(productTypes);
  }, [sourceJobs, allProducts]);

  // Handlers
  const handleChange = (key: keyof typeof filters, value: string | null) => {
    setFilters({ ...filters, [key]: value === 'all' ? null : value });
  };

  return (
    <div className="p-3 w-full">
      <div className="flex items-center gap-2 mb-3">
        <Filter size={16} />
        <h3 className="text-sm font-medium">Job Filters</h3>
      </div>
      
      <div className="grid grid-cols-6 gap-2 mb-3">
        {/* Machine */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Machine</label>
          <Select
            value={filters.machine || 'all'}
            onValueChange={(val) => handleChange('machine', val)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="All Machines" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Machines</SelectItem>
              {allMachines.map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Crew/Skill */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Crew/Skill</label>
          <Select
            value={filters.crewSkill || 'all'}
            onValueChange={(val) => handleChange('crewSkill', val)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="All Crew/Skills" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Crew/Skills</SelectItem>
              {allCrewSkills.map(cs => (
                <SelectItem key={cs} value={cs}>
                  {cs.startsWith('crew:') 
                    ? `Crew: ${cs.substring(5)}`
                    : `Skill: ${cs.substring(6).charAt(0).toUpperCase() + cs.substring(6).slice(1)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Job */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Job</label>
          <Select
            value={filters.job || 'all'}
            onValueChange={(val) => handleChange('job', val)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="All Jobs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              {allJobTypes.map(j => (
                <SelectItem key={j} value={j}>{j}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Product */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Product</label>
          <Select
            value={filters.product || 'all'}
            onValueChange={(val) => handleChange('product', val)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="All Products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {allProductTypes.map(p => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Material */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Material</label>
          <Select
            value={filters.material || 'all'}
            onValueChange={(val) => handleChange('material', val)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="All Materials" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Materials</SelectItem>
              {allMaterials.map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Smart Search */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <label className="text-xs font-medium text-muted-foreground">Smart Search</label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="flex items-center">
                    <HelpCircle className="w-3 h-3 text-muted-foreground hover:text-foreground transition-colors" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left" align="start" className="max-w-sm w-80 p-4">
                  <div className="space-y-2 text-xs">
                    <div className="font-semibold text-sm border-b pb-1">🔍 Smart Search</div>
                    <div>• Matches across jobs, machines, materials, crew, skills, products</div>
                    <div>• Case-insensitive, partial text supported</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
            <Input 
              className="h-8 text-xs pl-7" 
              placeholder="Search jobs, machines, materials..." 
              value={filters.search || ""}
              onChange={(e) => handleChange('search', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Search Results Counter */}
      {filters?.search && (
        <div className="mt-2 text-xs text-muted-foreground">
          {jobsToShow.length} jobs match "{filters.search}"
        </div>
      )}
    </div>
  );
};
