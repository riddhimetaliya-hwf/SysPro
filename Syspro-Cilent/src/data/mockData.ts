import { Job, Machine, GanttConfig } from '../types/jobs';
import { addDays, format, differenceInDays } from 'date-fns';

// Generate date strings for the next N days
const generateDates = (startDate: Date, days: number): string[] => {
  return Array.from({ length: days }).map((_, index) => {
    return format(addDays(startDate, index), 'yyyy-MM-dd');
  });
};

// Mock data for machines/workstations
export const mockMachines: Machine[] = [
  { id: 'machine1', name: 'CNC Router', description: 'High precision router', capacity: 100 },
  { id: 'machine2', name: 'Laser Cutter', description: '500W CO2 laser', capacity: 80 },
  { id: 'machine3', name: 'Assembly Line A', description: 'Main assembly line', capacity: 120 },
  { id: 'machine4', name: 'Paint Booth', description: 'Automated painting', capacity: 70 },
  { id: 'machine5', name: 'Quality Check', description: 'Final inspection', capacity: 150 },
  { id: 'machine6', name: 'Packaging', description: 'Product packaging', capacity: 200 },
];

// Generate mock jobs with numerical IDs
export const generateMockJobs = (numDays: number = 14): Job[] => {
  const today = new Date();
  const dates = generateDates(today, numDays);
  
  const jobs: Job[] = [];
  let jobIdCounter = 1;

  // Create some mock jobs spread across machines and dates
  mockMachines.forEach(machine => {
    // Create 3-5 jobs per machine
    const numJobs = Math.floor(Math.random() * 3) + 3;
    
    for (let i = 0; i < numJobs; i++) {
      const startDateIndex = Math.floor(Math.random() * (dates.length - 3));
      const duration = Math.floor(Math.random() * 3) + 1; // 1-3 days duration
      
      const conflictOptions = ['none', 'capacity', 'material'] as const;
      const conflictType = conflictOptions[Math.floor(Math.random() * conflictOptions.length)];
      
      const hasDependency = Math.random() > 0.7; // 30% chance of having dependencies
      
      // New status logic:
      const rawStatusOptions = ['pending', 'in-progress', 'completed', 'delayed'] as const;
      const rawStatus = rawStatusOptions[Math.floor(Math.random() * rawStatusOptions.length)];
      let status: 'Pending' | 'Completed' | 'OnHold';
      if (rawStatus === 'completed') {
        status = 'Completed';
      } else if (rawStatus === 'delayed') {
        status = 'OnHold';
      } else {
        status = 'Pending';
      }
      
      const priorityOptions = ['low', 'medium', 'high', 'critical'] as const;
      const priority = priorityOptions[Math.floor(Math.random() * priorityOptions.length)];

      const jobTypes = ['Assembly', 'Machining', 'Welding', 'Inspection', 'Packaging'];
      const crewNames = ['Alpha Team', 'Beta Team', 'Gamma Team', 'Delta Team'];
      const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'] as const;

      jobs.push({
        id: jobIdCounter,
        name: `Job ${String(jobIdCounter).padStart(3, '0')}`,
        description: `Task for ${machine.name} - Batch ${100 + i}`,
        machineId: machine.id,
        startDate: dates[startDateIndex],
        endDate: dates[startDateIndex + duration],
        conflictType,
        hasDependency,
        dependencies: hasDependency && jobIdCounter > 1 ? [Math.max(1, jobIdCounter - 1)] : undefined,
        status,
        materials: [
          {
            id: `MAT-${String(jobIdCounter).padStart(3, '0')}`,
            name: ['Steel Frame', 'Aluminum Rod', 'Copper Wire', 'Plastic Resin'][jobIdCounter % 4],
            required: Math.floor(Math.random() * 100) + 10,
            available: Math.floor(Math.random() * 80) + 20,
            unit: ['kg', 'pcs', 'm', 'L'][jobIdCounter % 4],
            status: ['available', 'low', 'critical'][Math.floor(Math.random() * 3)] as 'available' | 'low' | 'critical',
            supplier: ['SteelCorp', 'MetalWorks', 'WireTech', 'PolySupply'][jobIdCounter % 4],
            cost: Math.floor(Math.random() * 100) + 25
          }
        ],
        product: {
          id: `PROD-${String(jobIdCounter).padStart(3, '0')}`,
          name: `Product ${String(jobIdCounter).padStart(3, '0')}`,
          description: `End product from ${jobTypes[jobIdCounter % jobTypes.length]} process`,
          category: ['Electronics', 'Automotive', 'Industrial', 'Consumer'][jobIdCounter % 4]
        },
        priority,
        crewName: crewNames[jobIdCounter % crewNames.length],
        skillLevel: skillLevels[Math.floor(Math.random() * skillLevels.length)],
        jobType: jobTypes[jobIdCounter % jobTypes.length],
        workOrderId: `WO-${String(jobIdCounter).padStart(3, '0')}`
      });

      jobIdCounter++;
    }
  });

  // Create some dependencies with numerical IDs
  jobs.forEach(job => {
    if (job.hasDependency) {
      const potentialDependencies = jobs.filter(j => 
        j.id !== job.id && 
        new Date(j.endDate) <= new Date(job.startDate)
      );
      
      if (potentialDependencies.length > 0) {
        const dependency = potentialDependencies[Math.floor(Math.random() * potentialDependencies.length)];
        job.dependencies = [dependency.id];
      } else {
        job.hasDependency = false;
      }
    }
  });

  return jobs;
};

// Default configuration
export const defaultConfig: GanttConfig = {
  timeHorizon: 14,
  detectCapacityConflicts: true,
  detectMaterialConflicts: true,
  enforceDependencies: true,
  dayStartHour: 8,
  dayEndHour: 17
};

// Function to get position and width for job elements based on the timeline
export const getJobPosition = (
  job: Job, 
  startDate: Date, 
  cellWidth: number
): { left: number; width: number } => {
  const jobStart = new Date(job.startDate);
  const jobEnd = new Date(job.endDate);
  
  const startDiff = differenceInDays(jobStart, startDate);
  const duration = differenceInDays(jobEnd, jobStart);
  
  return {
    left: startDiff * cellWidth,
    width: Math.max(1, duration) * cellWidth
  };
};