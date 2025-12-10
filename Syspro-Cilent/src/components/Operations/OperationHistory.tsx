
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { Undo2, Redo2, History } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Operation {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  data?: any;
  undoAction?: () => void;
  redoAction?: () => void;
}

interface OperationHistoryContextType {
  operations: Operation[];
  currentIndex: number;
  addOperation: (operation: Omit<Operation, 'id' | 'timestamp'>) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const OperationHistoryContext = createContext<OperationHistoryContextType | undefined>(undefined);

export const useOperationHistory = () => {
  const context = useContext(OperationHistoryContext);
  if (!context) {
    throw new Error('useOperationHistory must be used within OperationHistoryProvider');
  }
  return context;
};

interface OperationHistoryProviderProps {
  children: ReactNode;
}

export const OperationHistoryProvider = ({ children }: OperationHistoryProviderProps) => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const addOperation = (operation: Omit<Operation, 'id' | 'timestamp'>) => {
    const newOperation: Operation = {
      ...operation,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    setOperations(prev => {
      // Remove any operations after current index (when adding after undo)
      const newOps = prev.slice(0, currentIndex + 1);
      return [...newOps, newOperation];
    });
    
    setCurrentIndex(prev => prev + 1);
  };

  const undo = () => {
    if (currentIndex >= 0) {
      const operation = operations[currentIndex];
      if (operation.undoAction) {
        operation.undoAction();
        setCurrentIndex(prev => prev - 1);
        toast.info(`Undid: ${operation.description}`);
      }
    }
  };

  const redo = () => {
    if (currentIndex < operations.length - 1) {
      const operation = operations[currentIndex + 1];
      if (operation.redoAction) {
        operation.redoAction();
        setCurrentIndex(prev => prev + 1);
        toast.info(`Redid: ${operation.description}`);
      }
    }
  };

  const canUndo = currentIndex >= 0;
  const canRedo = currentIndex < operations.length - 1;

  const value: OperationHistoryContextType = {
    operations,
    currentIndex,
    addOperation,
    undo,
    redo,
    canUndo,
    canRedo,
  };

  return (
    <OperationHistoryContext.Provider value={value}>
      {children}
    </OperationHistoryContext.Provider>
  );
};

export const OperationHistoryControls = () => {
  const { undo, redo, canUndo, canRedo, operations, currentIndex } = useOperationHistory();

  const recentOperations = operations.slice(Math.max(0, operations.length - 5));

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={undo}
        disabled={!canUndo}
        className="gap-1"
      >
        <Undo2 size={16} />
        Undo
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={redo}
        disabled={!canRedo}
        className="gap-1"
      >
        <Redo2 size={16} />
        Redo
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1">
            <History size={16} />
            History
            {operations.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {operations.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-3">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Recent Operations</h4>
            {recentOperations.length > 0 ? (
              <div className="space-y-2">
                {recentOperations.map((operation, index) => (
                  <div
                    key={operation.id}
                    className={`p-2 rounded-md text-sm ${
                      currentIndex === operations.indexOf(operation)
                        ? 'bg-primary/10 border border-primary/20'
                        : 'bg-muted/50'
                    }`}
                  >
                    <div className="font-medium">{operation.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {operation.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No operations yet</p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
