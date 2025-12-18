
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, X, Clock, User, Settings, AlertTriangle } from 'lucide-react';
import { Job } from '@/types/jobs';
import { stripLeadingZeros } from '@/lib/utils';
interface JobCardExplanationOverlayProps {
  job: Job;
  onClose: () => void;
}

export const JobCardExplanationOverlay = ({ job, onClose }: JobCardExplanationOverlayProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-500" />
            Job Card Guide
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4" />
                Understanding Job Cards
              </h4>
              <p className="text-sm text-blue-700">
                Each job card represents a scheduled task on your production floor. The visual design and colors provide instant feedback about the job's status and requirements.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Key Information Displayed:</h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <strong>Job Name & ID:</strong> Identifies the specific task ({stripLeadingZeros(job.name)} - {job.id})
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <strong>Machine Assignment:</strong> Shows which machine will handle the job
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <strong>Crew/Skill Level:</strong> Indicates required expertise or assigned personnel
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <strong>Duration & Timing:</strong> Shows job length and scheduling position
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-800 flex items-center gap-2 mb-2">
                <User className="w-4 h-4" />
                Crew vs. Skill Information
              </h4>
              <p className="text-sm text-yellow-700 mb-2">
                Jobs can display either specific crew assignments or required skill levels:
              </p>
              <div className="text-xs space-y-1">
                <div><strong>Crew Name:</strong> When a specific team is assigned (e.g., "Alpha Team")</div>
                <div><strong>Skill Level:</strong> When only skill requirements are defined (e.g., "Advanced", "Expert")</div>
              </div>
            </div>

            {job.conflictType !== 'none' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-800 flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  Current Job Status
                </h4>
                <p className="text-sm text-red-700">
                  This job has a <strong>{job.conflictType}</strong> conflict that needs attention. 
                  Click on the job card for more details and resolution options.
                </p>
              </div>
            )}

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-2">
                <Settings className="w-4 h-4" />
                Interactive Features
              </h4>
              <div className="text-sm text-gray-700 space-y-1">
                <div>• <strong>Click:</strong> View detailed job information</div>
                <div>• <strong>Drag:</strong> Reschedule or reassign the job</div>
                <div>• <strong>Hover:</strong> See quick summary and status</div>
                <div>• <strong>Right-click:</strong> Access additional options</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
