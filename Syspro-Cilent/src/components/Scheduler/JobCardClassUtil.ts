
import { cn } from '@/lib/utils';

interface GetJobCardClassParams {
  conflictType: 'none' | 'capacity' | 'material' | 'resource';
  hasDependency: boolean;
  isDragging: boolean;
}

export const getJobCardClass = ({ conflictType, hasDependency, isDragging }: GetJobCardClassParams) => {
  let baseClasses = "gantt-job";
  
  // Add conflict-specific classes
  switch (conflictType) {
    case 'capacity':
      baseClasses += " gantt-job-capacity-conflict";
      break;
    case 'material':
      baseClasses += " gantt-job-material-conflict";
      break;
    case 'resource':
      baseClasses += " gantt-job-resource-conflict";
      break;
    default:
      baseClasses += " gantt-job-no-conflict";
  }
  
  // Add dependency border if needed
  if (hasDependency) {
    baseClasses += " gantt-job-dependency";
  }
  
  return cn(baseClasses, isDragging && "dragging");
};
