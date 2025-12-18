
import React, { useState, useEffect } from 'react';
import { Job } from '@/types/jobs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Undo, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface ReschedulingIntelligenceProps {
  movedJob: Job;
  impactedJobs: Job[];
  onUndo: () => void;
  onApplySuggestion: (suggestion: ScheduleSuggestion) => void;
  onConfirm: () => void;
}

interface ScheduleSuggestion {
  id: string;
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  affectedJobs: string[];
  estimatedTime: string;
}

export const ReschedulingIntelligence = ({ 
  movedJob, 
  impactedJobs, 
  onUndo, 
  onApplySuggestion,
  onConfirm 
}: ReschedulingIntelligenceProps) => {
  const [suggestions, setSuggestions] = useState<ScheduleSuggestion[]>([]);
  const [deliveryImpact, setDeliveryImpact] = useState<{
    missedSLAs: number;
    delayedOrders: string[];
    totalDelay: number;
  } | null>(null);

  useEffect(() => {
    // Generate intelligent suggestions based on the move
    const generateSuggestions = () => {
      const newSuggestions: ScheduleSuggestion[] = [];

      if (impactedJobs.length > 0) {
        newSuggestions.push({
          id: '1',
          title: 'Optimize Downstream Flow',
          description: `Automatically adjust ${impactedJobs.length} downstream jobs to minimize conflicts`,
          impact: 'positive',
          affectedJobs: impactedJobs.map(j => j.id.toString()),
          estimatedTime: '2 minutes saved'
        });
      }

      // Check for potential delivery impact
      const hasDeliveryImpact = Math.random() > 0.6; // Mock logic
      if (hasDeliveryImpact) {
        setDeliveryImpact({
          missedSLAs: 1,
          delayedOrders: ['SO-2024-001'],
          totalDelay: 4 // hours
        });

        newSuggestions.push({
          id: '2',
          title: 'Expedite Critical Path',
          description: 'Move high-priority job to earlier slot to meet SLA',
          impact: 'positive',
          affectedJobs: [movedJob.id.toString()],
          estimatedTime: 'Recovers 4 hours'
        });
      }

      newSuggestions.push({
        id: '3',
        title: 'Resource Rebalancing',
        description: 'Redistribute machine load for optimal utilization',
        impact: 'neutral',
        affectedJobs: [],
        estimatedTime: 'Maintains current timeline'
      });

      setSuggestions(newSuggestions);
    };

    generateSuggestions();
  }, [movedJob, impactedJobs]);

  const getImpactIcon = (impact: ScheduleSuggestion['impact']) => {
    switch (impact) {
      case 'positive':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'negative':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getImpactColor = (impact: ScheduleSuggestion['impact']) => {
    switch (impact) {
      case 'positive':
        return 'border-green-200 bg-green-50';
      case 'negative':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Rescheduling Impact Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Move Summary */}
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Job Moved: {movedJob.name}</h4>
            <div className="text-sm text-muted-foreground">
              <p>Impact: {impactedJobs.length} downstream jobs affected</p>
            </div>
          </div>

          {/* Delivery Impact Alert */}
          {deliveryImpact && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="font-medium text-red-700">Delivery Impact Detected</span>
              </div>
              <div className="text-sm text-red-600 space-y-1">
                <p>• {deliveryImpact.missedSLAs} SLA potentially missed</p>
                <p>• Orders affected: {deliveryImpact.delayedOrders.join(', ')}</p>
                <p>• Total delay: {deliveryImpact.totalDelay} hours</p>
              </div>
            </div>
          )}

          {/* Visual Ripple Effect */}
          <div className="space-y-2">
            <h4 className="font-medium">Ripple Effect Visualization</h4>
            <div className="flex items-center gap-2 overflow-x-auto">
              <div className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-medium whitespace-nowrap">
                {movedJob.name}
              </div>
              <div className="w-4 h-0.5 bg-gradient-to-r from-primary to-muted"></div>
              {impactedJobs.slice(0, 3).map((job, index) => (
                <React.Fragment key={job.id}>
                  <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded text-sm whitespace-nowrap">
                    {job.name}
                  </div>
                  {index < Math.min(impactedJobs.length - 1, 2) && (
                    <div className="w-4 h-0.5 bg-gradient-to-r from-orange-200 to-muted"></div>
                  )}
                </React.Fragment>
              ))}
              {impactedJobs.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{impactedJobs.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="space-y-3">
            <h4 className="font-medium">AI Suggestions</h4>
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className={`p-3 border rounded-lg ${getImpactColor(suggestion.impact)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getImpactIcon(suggestion.impact)}
                    <span className="font-medium text-sm">{suggestion.title}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {suggestion.estimatedTime}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{suggestion.description}</p>
                {suggestion.affectedJobs.length > 0 && (
                  <p className="text-xs text-muted-foreground mb-2">
                    Affects: {suggestion.affectedJobs.join(', ')}
                  </p>
                )}
                <Button
                  size="sm"
                  onClick={() => onApplySuggestion(suggestion)}
                  className="w-full"
                >
                  Apply Suggestion
                </Button>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onUndo} className="flex-1">
              <Undo className="w-4 h-4 mr-1" />
              Undo Move
            </Button>
            <Button onClick={onConfirm} className="flex-1">
              Confirm Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
