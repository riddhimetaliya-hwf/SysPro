
import React, { useState } from 'react';
import { Button } from "@/components/UI/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/UI/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/UI/dialog";
import { HelpCircle, Play, ArrowRight, CheckCircle } from "lucide-react";
import { Badge } from "@/components/UI/badge";
import { toast } from "sonner";

interface ContextualHelpProps {
  title: string;
  content: string;
  children: React.ReactNode;
}

export const ContextualHelp = ({ title, content, children }: ContextualHelpProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 shadow-medium">
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">{title}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{content}</p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const HelpButton = React.forwardRef<HTMLButtonElement, { content: string }>(({ content }, ref) => {
  return (
    <Button 
      ref={ref}
      variant="ghost" 
      size="sm" 
      className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
    >
      <HelpCircle size={14} />
    </Button>
  );
});

HelpButton.displayName = "HelpButton";

interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string;
}

export const GuidedTour = () => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to SysPlanoViz',
      content: 'Let\'s take a quick tour of the main features to get you started with scheduling.',
      target: 'main'
    },
    {
      id: 'search',
      title: 'Global Search',
      content: 'Use Ctrl+K to quickly search for jobs, machines, and reports. Try it now!',
      target: 'search'
    },
    {
      id: 'gantt',
      title: 'Gantt Chart',
      content: 'Drag and drop jobs to reschedule them. The system will automatically detect conflicts.',
      target: 'gantt'
    },
    {
      id: 'filters',
      title: 'Smart Filters',
      content: 'Use filters to quickly find specific jobs or machines. You can combine multiple filters.',
      target: 'filters'
    },
    {
      id: 'floating-action',
      title: 'Quick Actions',
      content: 'Click the floating button for quick access to common actions like adding jobs.',
      target: 'fab'
    }
  ];

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setOpen(false);
      setCurrentStep(0);
      toast.success('Tour completed! You\'re ready to start scheduling.');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Play size={16} />
          Take Tour
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{tourSteps[currentStep].title}</span>
            <Badge variant="secondary">
              {currentStep + 1} / {tourSteps.length}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {tourSteps[currentStep].content}
          </p>
          
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            
            <div className="flex gap-1">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            
            <Button size="sm" onClick={handleNext}>
              {currentStep === tourSteps.length - 1 ? (
                <>
                  <CheckCircle size={16} className="mr-1" />
                  Finish
                </>
              ) : (
                <>
                  Next
                  <ArrowRight size={16} className="ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
