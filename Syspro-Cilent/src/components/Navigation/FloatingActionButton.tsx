// FloatingActionButton.tsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import { Button } from "@/components/UI/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/UI/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { Plus } from "lucide-react";
import { apiService } from "@/services/api";
import { Job, FilterOptions } from "@/types/jobs";
import { useFilters } from "@/contexts/FilterContext";

export const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [allProducts, setAllProducts] = useState<string[]>([]);

  const { filters: currentFilters, setFilters } = useFilters();

  // Local selections
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [selectedCrewSkill, setSelectedCrewSkill] = useState<string | null>(
    null
  );

  // Filtered options based on selections
  const [filteredMachines, setFilteredMachines] = useState<string[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<string[]>([]);
  const [filteredCrewSkills, setFilteredCrewSkills] = useState<string[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<string[]>([]);

  // Fetch jobs
  useEffect(() => {
    apiService.fetchJobs().then((fetched) => setAllJobs(fetched ?? []));
  }, []);

  // Fetch products
  useEffect(() => {
    apiService.fetchProducts().then((fetched) => setAllProducts(fetched ?? []));
  }, []);

  // Derived filter options
  const allMachines = useMemo(() => {
    const machines = new Set<string>();
    allJobs.forEach((job) => job.machineId && machines.add(job.machineId));
    return Array.from(machines);
  }, [allJobs]);

  const allMaterials = useMemo(() => {
    const materials = new Set<string>();
    allJobs.forEach((job) =>
      job.materials?.forEach(
        (material) => material?.name && materials.add(material.name)
      )
    );
    return Array.from(materials);
  }, [allJobs]);

  const allCrewSkills = useMemo(() => {
    const crewSkills = new Set<string>();
    allJobs.forEach((job) => {
      if (job.crewName) crewSkills.add(`crew:${job.crewName}`);
      if (job.skillLevel) crewSkills.add(`skill:${job.skillLevel}`);
    });
    return Array.from(crewSkills);
  }, [allJobs]);

  const allJobTypes = useMemo(() => {
    const jobTypes = new Set<string>();
    allJobs.forEach((job) => {
      if (job.jobType) jobTypes.add(job.jobType);
      if (job.name) jobTypes.add(job.name);
    });
    return Array.from(jobTypes);
  }, [allJobs]);

  const allProductTypes = useMemo(() => {
    const productTypes = new Set<string>();
    allJobs.forEach(
      (job) => job.product?.category && productTypes.add(job.product.category)
    );
    return Array.from(productTypes);
  }, [allJobs]);

  // Initialize filtered options with all options
  useEffect(() => {
    setFilteredMachines(allMachines);
    setFilteredMaterials(allMaterials);
    setFilteredCrewSkills(allCrewSkills);
    setFilteredProducts(allProductTypes);
  }, [allMachines, allMaterials, allCrewSkills, allProductTypes]);

  // Cascading dropdown logic
  useEffect(() => {
    // Filter machines based on selected job
    if (selectedJob && selectedJob !== "all") {
      const jobMachines = allJobs
        .filter(
          (job) => job.name === selectedJob || job.jobType === selectedJob
        )
        .map((job) => job.machineId)
        .filter(Boolean);
      setFilteredMachines([...new Set(jobMachines)]);
    } else {
      setFilteredMachines(allMachines);
    }
  }, [selectedJob, allJobs, allMachines]);

  useEffect(() => {
    // Filter materials based on selected job and machine
    let filteredJobs = allJobs;

    if (selectedJob && selectedJob !== "all") {
      filteredJobs = filteredJobs.filter(
        (job) => job.name === selectedJob || job.jobType === selectedJob
      );
    }

    if (selectedMachine && selectedMachine !== "all") {
      filteredJobs = filteredJobs.filter(
        (job) => job.machineId === selectedMachine
      );
    }

    const materials = new Set<string>();
    filteredJobs.forEach((job) =>
      job.materials?.forEach(
        (material) => material?.name && materials.add(material.name)
      )
    );
    setFilteredMaterials(Array.from(materials));
  }, [selectedJob, selectedMachine, allJobs]);

  useEffect(() => {
    // Filter crew/skills based on selected job, machine, and material
    let filteredJobs = allJobs;

    if (selectedJob && selectedJob !== "all") {
      filteredJobs = filteredJobs.filter(
        (job) => job.name === selectedJob || job.jobType === selectedJob
      );
    }

    if (selectedMachine && selectedMachine !== "all") {
      filteredJobs = filteredJobs.filter(
        (job) => job.machineId === selectedMachine
      );
    }

    if (selectedMaterial && selectedMaterial !== "all") {
      filteredJobs = filteredJobs.filter((job) =>
        job.materials?.some((material) => material.name === selectedMaterial)
      );
    }

    const crewSkills = new Set<string>();
    filteredJobs.forEach((job) => {
      if (job.crewName) crewSkills.add(`crew:${job.crewName}`);
      if (job.skillLevel) crewSkills.add(`skill:${job.skillLevel}`);
    });
    setFilteredCrewSkills(Array.from(crewSkills));
  }, [selectedJob, selectedMachine, selectedMaterial, allJobs]);

  useEffect(() => {
    // Filter products based on all previous selections
    let filteredJobs = allJobs;

    if (selectedJob && selectedJob !== "all") {
      filteredJobs = filteredJobs.filter(
        (job) => job.name === selectedJob || job.jobType === selectedJob
      );
    }

    if (selectedMachine && selectedMachine !== "all") {
      filteredJobs = filteredJobs.filter(
        (job) => job.machineId === selectedMachine
      );
    }

    if (selectedMaterial && selectedMaterial !== "all") {
      filteredJobs = filteredJobs.filter((job) =>
        job.materials?.some((material) => material.name === selectedMaterial)
      );
    }

    if (selectedCrewSkill && selectedCrewSkill !== "all") {
      if (selectedCrewSkill.startsWith("crew:")) {
        const crewName = selectedCrewSkill.substring(5);
        filteredJobs = filteredJobs.filter((job) => job.crewName === crewName);
      } else if (selectedCrewSkill.startsWith("skill:")) {
        const skillLevel = selectedCrewSkill.substring(6);
        filteredJobs = filteredJobs.filter(
          (job) => job.skillLevel === skillLevel
        );
      }
    }

    const products = new Set<string>();
    filteredJobs.forEach((job) => {
      if (job.product?.category) products.add(job.product.category);
    });
    setFilteredProducts(Array.from(products));
  }, [
    selectedJob,
    selectedMachine,
    selectedMaterial,
    selectedCrewSkill,
    allJobs,
  ]);

  // Apply filter helper
  const updateFilters = (updates: Partial<FilterOptions>) => {
    setFilters({ ...currentFilters, ...updates });
  };

  // Clear filters
  const handleClear = () => {
    setSelectedJob(null);
    setSelectedProduct(null);
    setSelectedMachine(null);
    setSelectedMaterial(null);
    setSelectedCrewSkill(null);
    setFilters({
      machine: null,
      status: null,
      material: null,
      search: "",
      crewSkill: null,
      job: null,
      product: null,
    });
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            size="lg"
            className="rounded-full h-14 w-14 shadow-card-elevated hover:shadow-glow transition-all duration-300 hover:scale-110"
          >
            <Plus
              size={24}
              className={`transition-transform duration-200 ${
                isOpen ? "rotate-45" : ""
              }`}
            />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          side="top"
          align="end"
          className="w-72 p-3 shadow-card-elevated border bg-card/95 backdrop-blur-sm max-h-96 overflow-y-auto"
        >
          <div className="space-y-3">
            {/* Job Dropdown */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Jobs
              </label>
              <Select
                value={selectedJob ?? ""}
                onValueChange={(value) => {
                  setSelectedJob(value);
                  // Reset dependent selections
                  setSelectedMachine(null);
                  setSelectedMaterial(null);
                  setSelectedCrewSkill(null);
                  setSelectedProduct(null);
                  updateFilters({
                    job: value === "all" ? null : value,
                    machine: null,
                    material: null,
                    crewSkill: null,
                    product: null,
                  });
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All Jobs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  {allJobTypes.map((j) => (
                    <SelectItem key={j} value={j}>
                      {j}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Product Dropdown */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Products
              </label>
              <Select
                value={selectedProduct ?? ""}
                onValueChange={(value) => {
                  setSelectedProduct(value);
                  updateFilters({ product: value === "all" ? null : value });
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All Products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {filteredProducts.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Machine Dropdown */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Machines
              </label>
              <Select
                value={selectedMachine ?? ""}
                onValueChange={(value) => {
                  setSelectedMachine(value);
                  // Reset dependent selections
                  setSelectedMaterial(null);
                  setSelectedCrewSkill(null);
                  setSelectedProduct(null);
                  updateFilters({
                    machine: value === "all" ? null : value,
                    material: null,
                    crewSkill: null,
                    product: null,
                  });
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All Machines" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Machines</SelectItem>
                  {filteredMachines.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Material Dropdown */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Materials
              </label>
              <Select
                value={selectedMaterial ?? ""}
                onValueChange={(value) => {
                  setSelectedMaterial(value);
                  // Reset dependent selections
                  setSelectedCrewSkill(null);
                  setSelectedProduct(null);
                  updateFilters({
                    material: value === "all" ? null : value,
                    crewSkill: null,
                    product: null,
                  });
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All Materials" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Materials</SelectItem>
                  {filteredMaterials.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Crew/Skills Dropdown */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Crew / Skills
              </label>
              <Select
                value={selectedCrewSkill ?? ""}
                onValueChange={(value) => {
                  setSelectedCrewSkill(value);
                  // Reset dependent selections
                  setSelectedProduct(null);
                  updateFilters({
                    crewSkill: value === "all" ? null : value,
                    product: null,
                  });
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All Crew/Skills" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Crew/Skills</SelectItem>
                  {filteredCrewSkills.map((cs) => (
                    <SelectItem key={cs} value={cs}>
                      {cs.startsWith("crew:")
                        ? `Crew: ${cs.substring(5)}`
                        : `Skill: ${
                            cs.substring(6).charAt(0).toUpperCase() +
                            cs.substring(6).slice(1)
                          }`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Only Clear button */}
            <div className="flex mt-3">
              <Button
                className="flex-1"
                variant="outline"
                onClick={handleClear}
              >
                Clear
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
