import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, AlertTriangle, Clock, Zap } from 'lucide-react';
import { Job } from '@/types/jobs';
import { cn } from '@/lib/utils';

interface DragFeedback {
  isDragging: boolean;
  dragPreview?: Job;
  dropZone?: string;
  conflicts?: string[];
  suggestions?: string[];
}

interface EnhancedDragDropIndicatorProps {
  feedback: DragFeedback;
  className?: string;
}

export const EnhancedDragDropIndicator = ({ feedback, className }: EnhancedDragDropIndicatorProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (feedback.isDragging) {
        setPosition({ x: e.clientX + 10, y: e.clientY + 10 });
      }
    };

    if (feedback.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [feedback.isDragging]);

  if (!feedback.isDragging) return null;

  return (
    <>
      {/* Drag Preview */}
      <div
        ref={dragRef}
        className={cn(
          "fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-1/2",
          "animate-scale-in",
          className
        )}
        style={{ left: position.x, top: position.y }}
      >
        {feedback.dragPreview && (
          <Card className="p-3 bg-background/95 backdrop-blur-sm border-2 border-primary shadow-xl">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-medium">{feedback.dragPreview.name}</span>
              <Badge variant="outline" className="text-xs">
                {feedback.dragPreview.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {feedback.dragPreview.description}
            </p>
          </Card>
        )}
      </div>

      {/* Drop Zone Indicators */}
      {feedback.dropZone && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div className="absolute inset-0 bg-primary/5 animate-pulse">
            <div className="flex items-center justify-center h-full">
              <Card className="p-4 bg-background/90 backdrop-blur-sm border-2 border-primary">
                <div className="flex items-center gap-2 text-primary">
                  <ArrowRight className="w-5 h-5" />
                  <span className="font-medium">Drop on {feedback.dropZone}</span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Conflict Warnings */}
      {feedback.conflicts && feedback.conflicts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2 animate-slide-in-right">
          {feedback.conflicts.map((conflict, index) => (
            <Card key={index} className="p-3 bg-destructive/90 text-destructive-foreground border-destructive">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Conflict Detected</span>
              </div>
              <p className="text-xs mt-1">{conflict}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Smart Suggestions */}
      {feedback.suggestions && feedback.suggestions.length > 0 && (
        <div className="fixed top-4 left-4 z-50 space-y-2 animate-slide-in-left">
          {feedback.suggestions.map((suggestion, index) => (
            <Card key={index} className="p-3 bg-info/90 text-info-foreground border-info">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">Smart Suggestion</span>
              </div>
              <p className="text-xs mt-1">{suggestion}</p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

// Hook for managing drag and drop feedback
export const useDragDropFeedback = () => {
  const [feedback, setFeedback] = useState<DragFeedback>({
    isDragging: false,
  });

  const startDrag = (job: Job) => {
    setFeedback({
      isDragging: true,
      dragPreview: job,
      conflicts: [],
      suggestions: [],
    });
  };

  const updateDropZone = (zone: string, conflicts?: string[], suggestions?: string[]) => {
    setFeedback(prev => ({
      ...prev,
      dropZone: zone,
      conflicts: conflicts || [],
      suggestions: suggestions || [],
    }));
  };

  const endDrag = () => {
    setFeedback({
      isDragging: false,
    });
  };

  return {
    feedback,
    startDrag,
    updateDropZone,
    endDrag,
  };
};

// Enhanced Drop Zone Component
interface EnhancedDropZoneProps {
  onDrop: (job: Job) => void;
  onDragOver?: (job: Job) => { conflicts?: string[]; suggestions?: string[] };
  className?: string;
  children: React.ReactNode;
  zoneId: string;
}

export const EnhancedDropZone = ({ 
  onDrop, 
  onDragOver, 
  className, 
  children, 
  zoneId 
}: EnhancedDropZoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [feedback, setFeedback] = useState<{ conflicts?: string[]; suggestions?: string[] }>({});

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
    
    // Get job data from drag event
    try {
      const jobData = JSON.parse(e.dataTransfer.getData('application/job'));
      if (onDragOver) {
        const result = onDragOver(jobData);
        setFeedback(result);
      }
    } catch (error) {
      // Handle drag data parsing error
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
    setFeedback({});
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setFeedback({});
    
    try {
      const jobData = JSON.parse(e.dataTransfer.getData('application/job'));
      onDrop(jobData);
    } catch (error) {
      console.error('Failed to parse drop data:', error);
    }
  };

  return (
    <div
      className={cn(
        "relative transition-all duration-200",
        isDragOver && "ring-2 ring-primary ring-offset-2 bg-primary/5",
        feedback.conflicts?.length && "ring-destructive bg-destructive/5",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
      
      {/* Drop Zone Visual Feedback */}
      {isDragOver && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-primary/10 rounded-lg">
          <div className="bg-background/90 backdrop-blur-sm rounded-lg p-2 border-2 border-primary">
            <div className="flex items-center gap-2 text-primary">
              <ArrowRight className="w-4 h-4" />
              <span className="text-sm font-medium">Drop here</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};