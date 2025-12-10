
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Job, Machine } from '@/types/jobs';
import { Brain, Lightbulb, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface AISuggestion {
  id: string;
  type: 'optimization' | 'conflict' | 'prediction' | 'efficiency';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  actionable: boolean;
}

interface AISuggestionsProps {
  jobs: Job[];
  machines: Machine[];
}

export const AISuggestions = ({ jobs, machines }: AISuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateSuggestions();
  }, [jobs]);

  const generateSuggestions = () => {
    setLoading(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const newSuggestions: AISuggestion[] = [
        {
          id: '1',
          type: 'optimization',
          title: 'Optimal Slot Available',
          description: 'Move Job-003 to Machine-B at 2:00 PM for 23% efficiency gain',
          impact: 'high',
          confidence: 87,
          actionable: true
        },
        {
          id: '2',
          type: 'conflict',
          title: 'Material Conflict Predicted',
          description: 'Steel shortage expected in 3 days. Reschedule dependent jobs now.',
          impact: 'high',
          confidence: 92,
          actionable: true
        },
        {
          id: '3',
          type: 'prediction',
          title: 'Bottleneck Forecast',
          description: 'Machine-A will be overloaded next Tuesday. Consider load balancing.',
          impact: 'medium',
          confidence: 76,
          actionable: false
        },
        {
          id: '4',
          type: 'efficiency',
          title: 'Batch Processing Opportunity',
          description: 'Group similar jobs on Machine-C for 15% time reduction',
          impact: 'medium',
          confidence: 83,
          actionable: true
        }
      ];
      
      setSuggestions(newSuggestions);
      setLoading(false);
    }, 1500);
  };

  const applySuggestion = (suggestion: AISuggestion) => {
    toast.success('AI suggestion applied', {
      description: suggestion.title
    });
    
    // Remove applied suggestion
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  const getTypeIcon = (type: AISuggestion['type']) => {
    switch (type) {
      case 'optimization': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'conflict': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'prediction': return <Brain className="w-4 h-4 text-blue-500" />;
      case 'efficiency': return <Lightbulb className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getImpactColor = (impact: AISuggestion['impact']) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Insights ({suggestions.length})
          </CardTitle>
          <Button onClick={generateSuggestions} size="sm" variant="outline" disabled={loading}>
            {loading ? 'Analyzing...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-3 bg-muted/50 rounded-lg animate-pulse">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No new suggestions</p>
          </div>
        ) : (
          suggestions.map(suggestion => (
            <div key={suggestion.id} className="p-3 border rounded-lg space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(suggestion.type)}
                  <Badge className={`text-xs ${getImpactColor(suggestion.impact)}`}>
                    {suggestion.impact.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {suggestion.confidence}% confidence
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium">{suggestion.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {suggestion.description}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span>Confidence:</span>
                  <Progress value={suggestion.confidence} className="h-1 flex-1" />
                  <span>{suggestion.confidence}%</span>
                </div>
                
                {suggestion.actionable && (
                  <Button 
                    onClick={() => applySuggestion(suggestion)}
                    size="sm" 
                    className="w-full"
                  >
                    Apply Suggestion
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
