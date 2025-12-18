import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/UI/badge';
import { ScrollArea } from '@/components/UI/scroll-area';
import { 
  Bot, 
  Send, 
  Lightbulb, 
  AlertTriangle, 
  Calendar, 
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Job, Machine } from '@/types/jobs';
import { toast } from 'sonner';

interface AISuggestion {
  id: string;
  type: 'scheduling' | 'conflict' | 'optimization' | 'material';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  actions: {
    id: string;
    label: string;
    type: 'reschedule' | 'reorder' | 'substitute' | 'optimize';
  }[];
}

interface AIAssistantPanelProps {
  jobs: Job[];
  machines: Machine[];
  onJobSuggestion: (jobId: number, suggestion: AISuggestion) => void;
}

export const AIAssistantPanel = ({ jobs, machines, onJobSuggestion }: AIAssistantPanelProps) => {
  const [message, setMessage] = useState('');
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Generate AI suggestions based on current data
  const generateSuggestions = () => {
    const newSuggestions: AISuggestion[] = [];

    // Material shortage suggestions  
    const criticalMaterials = jobs.flatMap(job => job.materials || []).filter(m => m.status === 'critical' || m.status === 'low');
    criticalMaterials.forEach(material => {
      const affectedJobs = jobs.filter(job => 
        job.materials?.some(m => m.id === material.id)
      );

      if (affectedJobs.length > 0) {
        newSuggestions.push({
          id: `material-${material.id}`,
          type: 'material',
          title: `Critical Material Shortage: ${material.name}`,
          description: `${material.name} is ${material.status} (${material.available}/${material.required} ${material.unit}). ${affectedJobs.length} jobs affected.`,
          impact: material.status === 'critical' ? 'high' : 'medium',
          confidence: 95,
          actions: [
            { id: 'expedite', label: 'Expedite Material Order', type: 'reorder' },
            { id: 'reschedule', label: `Reschedule ${affectedJobs.length} Jobs`, type: 'reschedule' },
            { id: 'substitute', label: 'Find Material Substitute', type: 'substitute' }
          ]
        });
      }
    });

    // Scheduling optimization suggestions
    const highPriorityJobs = jobs.filter(job => job.priority === 'critical' || job.priority === 'high');
    if (highPriorityJobs.length > 3) {
      newSuggestions.push({
        id: 'priority-optimization',
        type: 'scheduling',
        title: 'High Priority Job Clustering',
        description: `${highPriorityJobs.length} high priority jobs detected. Consider load balancing across machines.`,
        impact: 'medium',
        confidence: 88,
        actions: [
          { id: 'balance', label: 'Auto-Balance Load', type: 'optimize' },
          { id: 'sequence', label: 'Optimize Sequence', type: 'reschedule' }
        ]
      });
    }

    // Conflict detection suggestions
    const conflictJobs = jobs.filter(job => job.conflictType !== 'none');
    if (conflictJobs.length > 0) {
      newSuggestions.push({
        id: 'conflict-resolution',
        type: 'conflict',
        title: 'Schedule Conflicts Detected',
        description: `${conflictJobs.length} jobs have scheduling conflicts. Immediate resolution recommended.`,
        impact: 'high',
        confidence: 92,
        actions: [
          { id: 'auto-resolve', label: 'Auto-Resolve Conflicts', type: 'reschedule' },
          { id: 'manual-review', label: 'Manual Review Required', type: 'optimize' }
        ]
      });
    }

    setSuggestions(newSuggestions);
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    setIsAnalyzing(true);
    // Simulate AI processing
    setTimeout(() => {
      generateSuggestions();
      setIsAnalyzing(false);
      toast.success('AI Analysis Complete', {
        description: `Generated ${suggestions.length + 1} smart suggestions`
      });
    }, 2000);

    setMessage('');
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'scheduling': return <Calendar className="w-4 h-4" />;
      case 'conflict': return <AlertTriangle className="w-4 h-4" />;
      case 'optimization': return <TrendingUp className="w-4 h-4" />;
      case 'material': return <Clock className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  // Auto-generate suggestions on data change
  useEffect(() => {
    generateSuggestions();
  }, [jobs, machines]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600" />
          AI Production Assistant
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{suggestions.length}</div>
            <div className="text-xs text-blue-600">Suggestions</div>
          </div>
          <div className="p-2 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{jobs.length}</div>
            <div className="text-xs text-green-600">Active Jobs</div>
          </div>
          <div className="p-2 bg-orange-50 rounded-lg">
            <div className="text-lg font-bold text-orange-600">
              {jobs.flatMap(j => j.materials || []).filter(m => m.status === 'critical' || m.status === 'low').length}
            </div>
            <div className="text-xs text-orange-600">Material Issues</div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Ask me about scheduling, conflicts, or optimization..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isAnalyzing || !message.trim()}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {isAnalyzing && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <Bot className="w-4 h-4 animate-pulse text-blue-600" />
            <span className="text-sm text-blue-800">Analyzing production data...</span>
          </div>
        )}

        {/* AI Suggestions */}
        <ScrollArea className="flex-1">
          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <Card key={suggestion.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(suggestion.type)}
                      <h4 className="font-semibold text-sm">{suggestion.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getImpactColor(suggestion.impact)} variant="outline">
                        {suggestion.impact.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {suggestion.confidence}% confident
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {suggestion.description}
                  </p>

                  <div className="space-y-2">
                    {suggestion.actions.map((action) => (
                      <Button
                        key={action.id}
                        variant="outline"
                        size="sm"
                        className="w-full justify-between text-xs"
                        onClick={() => onJobSuggestion(jobs[0]?.id || 1, suggestion)}
                      >
                        <span>{action.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {suggestions.length === 0 && !isAnalyzing && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm">No immediate issues detected</p>
                <p className="text-xs">Your production schedule looks optimized!</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};