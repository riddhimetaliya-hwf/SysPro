import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Badge } from '@/components/UI/badge';
import { Progress } from '@/components/UI/progress';
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Play, 
  Pause, 
  RotateCcw,
  CheckCircle,
  Users,
  Calendar,
  Settings,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for highlighting
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click' | 'hover' | 'input';
  video?: string; // Video URL for demonstration
  icon?: React.ReactNode;
}

interface InteractiveTutorialProps {
  tutorialId: string;
  steps: TutorialStep[];
  onComplete?: () => void;
  onSkip?: () => void;
  autoStart?: boolean;
  className?: string;
}

export const InteractiveTutorial = ({
  tutorialId,
  steps,
  onComplete,
  onSkip,
  autoStart = false,
  className
}: InteractiveTutorialProps) => {
  const [isActive, setIsActive] = useState(autoStart);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Check if tutorial was already completed
    const completed = localStorage.getItem(`tutorial-${tutorialId}`);
    if (completed && !autoStart) {
      setIsActive(false);
    }
  }, [tutorialId, autoStart]);

  useEffect(() => {
    if (isActive && steps[currentStep]?.target) {
      const element = document.querySelector(steps[currentStep].target!) as HTMLElement;
      if (element) {
        setHighlightedElement(element);
        element.classList.add('tutorial-highlight');
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    return () => {
      if (highlightedElement) {
        highlightedElement.classList.remove('tutorial-highlight');
      }
    };
  }, [currentStep, isActive]);

  const handleNext = () => {
    const currentStepData = steps[currentStep];
    
    // Mark step as completed
    setCompletedSteps(prev => [...prev, currentStepData.id]);
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(`tutorial-${tutorialId}`, 'completed');
    setIsActive(false);
    toast.success('Tutorial completed!', {
      description: 'You can restart it anytime from the help menu.'
    });
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem(`tutorial-${tutorialId}`, 'skipped');
    setIsActive(false);
    onSkip?.();
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setCompletedSteps([]);
    setIsActive(true);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  if (!isActive) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleRestart}
        className={cn("gap-2", className)}
      >
        <Play className="w-4 h-4" />
        Start Tutorial
      </Button>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" />
      
      {/* Tutorial Card */}
      <Card className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 z-50 shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentStepData.icon}
              <CardTitle className="text-base">{currentStepData.title}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {currentStep + 1} of {steps.length}
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleSkip} className="h-6 w-6 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Progress value={progress} className="h-1" />
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {currentStepData.description}
          </p>

          {/* Video Demonstration */}
          {currentStepData.video && (
            <div className="relative bg-muted rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Play className="w-6 h-6 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Video demonstration available</p>
            </div>
          )}

          {/* Action Hint */}
          {currentStepData.action && (
            <div className="flex items-center gap-2 p-2 bg-info/10 rounded-md">
              <div className="w-2 h-2 bg-info rounded-full animate-pulse" />
              <span className="text-xs text-info-foreground">
                {currentStepData.action === 'click' && 'Click the highlighted element'}
                {currentStepData.action === 'hover' && 'Hover over the highlighted element'}
                {currentStepData.action === 'input' && 'Enter text in the highlighted field'}
              </span>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleSkip}>
                Skip Tour
              </Button>
              <Button onClick={handleNext} size="sm" className="gap-2">
                {currentStep === steps.length - 1 ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Complete
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

// Predefined tutorial configurations
export const tutorialConfigs = {
  dashboard: {
    id: 'dashboard-basics',
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to Your Dashboard',
        description: 'Let\'s take a quick tour of your scheduling dashboard and its key features.',
        icon: <Users className="w-4 h-4" />
      },
      {
        id: 'gantt-view',
        title: 'Gantt Chart View',
        description: 'This is your main schedule view. Jobs are displayed as bars across a timeline.',
        target: '[data-testid="gantt-chart"]',
        icon: <Calendar className="w-4 h-4" />
      },
      {
        id: 'filters',
        title: 'Smart Filters',
        description: 'Use these filters to quickly find specific jobs, machines, or materials.',
        target: '[data-testid="job-filters"]',
        action: 'click' as const,
        icon: <Settings className="w-4 h-4" />
      },
      {
        id: 'analytics',
        title: 'Performance Analytics',
        description: 'Track your scheduling performance and identify optimization opportunities.',
        target: '[data-testid="analytics-panel"]',
        icon: <BarChart3 className="w-4 h-4" />
      }
    ]
  },
  scheduling: {
    id: 'scheduling-basics', 
    steps: [
      {
        id: 'drag-drop',
        title: 'Drag & Drop Scheduling',
        description: 'Simply drag jobs between machines or time slots to reschedule them.',
        target: '[data-job-id]',
        action: 'click' as const
      },
      {
        id: 'conflicts',
        title: 'Conflict Detection',
        description: 'The system automatically detects scheduling conflicts and suggests solutions.',
        target: '[data-testid="conflict-panel"]'
      }
    ]
  }
};

// Tutorial Provider Component
export const TutorialProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeTutorial, setActiveTutorial] = useState<string | null>(null);

  const startTutorial = (tutorialId: keyof typeof tutorialConfigs) => {
    setActiveTutorial(tutorialId);
  };

  return (
    <div>
      {children}
      {activeTutorial && (
        <InteractiveTutorial
          tutorialId={tutorialConfigs[activeTutorial as keyof typeof tutorialConfigs].id}
          steps={tutorialConfigs[activeTutorial as keyof typeof tutorialConfigs].steps}
          onComplete={() => setActiveTutorial(null)}
          onSkip={() => setActiveTutorial(null)}
          autoStart
        />
      )}
    </div>
  );
};