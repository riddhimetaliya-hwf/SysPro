import React from 'react';
import { Job } from '../../types/jobs';
import { format } from 'date-fns';
import { X, Check, AlertTriangle } from 'lucide-react';

interface MoveConfirmationPopoverProps {
  job: Job;
  newMachineId: string;
  newStartDate: Date;
  onConfirm: () => void;
  onCancel: () => void;
}

export const MoveConfirmationPopover: React.FC<MoveConfirmationPopoverProps> = ({
  job,
  newMachineId,
  newStartDate,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* Semi-transparent backdrop */}
      <div 
        className="absolute inset-0 bg-black/20" 
        onClick={onCancel}
      />
      
      {/* Popover */}
      <div className="relative bg-white rounded-lg shadow-xl border border-gray-200 w-80">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            Confirm Job Move
          </h3>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <p className="text-sm text-gray-600">
            Are you sure you want to move this job?
          </p>
          
          <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Job:</span>
              <span>{job.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">New Machine:</span>
              <span>{newMachineId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">New Start Date:</span>
              <span>{format(newStartDate, 'MMM d, yyyy')}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Move Job
          </button>
        </div>
      </div>
    </div>
  );
};