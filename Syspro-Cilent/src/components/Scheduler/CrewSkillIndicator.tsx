
import React from 'react';
import { Badge } from '@/components/UI/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/UI/tooltip';
import { User, Users, Wrench, Star } from 'lucide-react';

interface CrewSkillIndicatorProps {
  crewName?: string;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  requiredSkills?: string[];
  jobId: string;
}

export const CrewSkillIndicator = ({ crewName, skillLevel, requiredSkills = [], jobId }: CrewSkillIndicatorProps) => {
  const getSkillIcon = () => {
    switch (skillLevel) {
      case 'expert': return { icon: Star, color: 'text-yellow-500', label: 'Expert' };
      case 'advanced': return { icon: Wrench, color: 'text-blue-500', label: 'Advanced' };
      case 'intermediate': return { icon: User, color: 'text-green-500', label: 'Intermediate' };
      default: return { icon: User, color: 'text-gray-500', label: 'Beginner' };
    }
  };

  const skill = getSkillIcon();
  const SkillIcon = skill.icon;
  
  // Fallback to skill level if crew name is not available
  const displayText = crewName || skill.label;
  const isCrewMode = Boolean(crewName);

  return (
    <TooltipProvider>
      <Tooltip>
        {/* <TooltipTrigger>
          <div className="flex items-center gap-1 text-xs">
            {isCrewMode ? (
              <Users className="w-3 h-3 text-blue-600" />
            ) : (
              <SkillIcon className={`w-3 h-3 ${skill.color}`} />
            )}
            <span className="truncate max-w-20">{displayText}</span>
          </div>
        </TooltipTrigger> */}
        <TooltipContent side="right" sideOffset={10} className="max-w-xs">
          <div className="space-y-2">
            <div className="font-semibold">
              {isCrewMode ? 'Assigned Crew' : 'Required Skill Level'}
            </div>
            <div className="text-sm">
              {isCrewMode ? (
                <div>
                  <div>Crew: <span className="font-medium">{crewName}</span></div>
                  {skillLevel && (
                    <div>Skill Level: <span className="font-medium capitalize">{skillLevel}</span></div>
                  )}
                </div>
              ) : (
                <div>Minimum Skill: <span className="font-medium capitalize">{skillLevel || 'beginner'}</span></div>
              )}
            </div>
            {requiredSkills.length > 0 && (
              <div className="text-sm">
                <div className="font-medium mb-1">Required Skills:</div>
                <div className="flex flex-wrap gap-1">
                  {requiredSkills.map((skill, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="text-xs text-muted-foreground border-t pt-2">
              Job ID: {jobId}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
