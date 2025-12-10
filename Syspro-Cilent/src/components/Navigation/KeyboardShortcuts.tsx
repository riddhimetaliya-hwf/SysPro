
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Keyboard, Search, Plus, Settings, BarChart3 } from "lucide-react";
import { toast } from "sonner";

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
  action: () => void;
}

export const KeyboardShortcuts = () => {
  const [open, setOpen] = useState(false);

  const shortcuts: Shortcut[] = [
    // Navigation
    { keys: ['Ctrl', 'K'], description: 'Open global search', category: 'Navigation', action: () => toast.info('Search opened') },
    { keys: ['G', 'H'], description: 'Go to home', category: 'Navigation', action: () => window.location.href = '/' },
    { keys: ['G', 'C'], description: 'Go to configuration', category: 'Navigation', action: () => window.location.href = '/configuration' },
    { keys: ['G', 'R'], description: 'Go to reports', category: 'Navigation', action: () => window.location.href = '/reports' },
    { keys: ['G', 'S'], description: 'Go to sync status', category: 'Navigation', action: () => window.location.href = '/sync-status' },
    
    // Actions
    { keys: ['Ctrl', 'N'], description: 'Add new job', category: 'Actions', action: () => toast.success('New job dialog opened') },
    { keys: ['Ctrl', 'M'], description: 'Schedule maintenance', category: 'Actions', action: () => toast.success('Maintenance dialog opened') },
    { keys: ['Ctrl', 'S'], description: 'Save changes', category: 'Actions', action: () => toast.success('Changes saved') },
    { keys: ['Ctrl', 'Z'], description: 'Undo last action', category: 'Actions', action: () => toast.info('Action undone') },
    { keys: ['Ctrl', 'Y'], description: 'Redo last action', category: 'Actions', action: () => toast.info('Action redone') },
    
    // Views
    { keys: ['1'], description: 'Switch to Gantt view', category: 'Views', action: () => toast.info('Gantt view selected') },
    { keys: ['2'], description: 'Switch to Card view', category: 'Views', action: () => toast.info('Card view selected') },
    { keys: ['T'], description: 'Navigate to today', category: 'Views', action: () => toast.info('Navigated to today') },
    { keys: ['←'], description: 'Previous time period', category: 'Views', action: () => toast.info('Previous period') },
    { keys: ['→'], description: 'Next time period', category: 'Views', action: () => toast.info('Next period') },
    
    // General
    { keys: ['?'], description: 'Show keyboard shortcuts', category: 'General', action: () => setOpen(true) },
    { keys: ['Esc'], description: 'Close dialogs/panels', category: 'General', action: () => toast.info('Dialogs closed') },
  ];

  const categories = [...new Set(shortcuts.map(s => s.category))];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const shortcut = shortcuts.find(s => {
        if (s.keys.length === 1) {
          return e.key === s.keys[0] && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey;
        } else if (s.keys.length === 2) {
          const [modifier, key] = s.keys;
          if (modifier === 'Ctrl') {
            return (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === key.toLowerCase();
          }
          return e.key === key && !e.ctrlKey && !e.metaKey;
        }
        return false;
      });

      if (shortcut) {
        e.preventDefault();
        shortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const formatKeys = (keys: string[]) => {
    return keys.map(key => {
      switch (key) {
        case 'Ctrl': return '⌘';
        case '←': return '←';
        case '→': return '→';
        default: return key;
      }
    }).join('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Keyboard size={16} />
          Shortcuts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard size={20} />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {categories.map(category => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                {category}
              </h3>
              <div className="grid gap-2">
                {shortcuts
                  .filter(s => s.category === category)
                  .map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/50 transition-colors">
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <Badge 
                            key={keyIndex} 
                            variant="outline" 
                            className="text-xs px-2 py-1 font-mono"
                          >
                            {formatKeys([key])}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
