import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Keyboard, Search, Calendar, LayoutGrid, Users, Zap, Settings, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Command } from 'lucide-react';

interface KeyboardShortcut {
  category: string;
  shortcuts: {
    keys: string[];
    description: string;
    icon?: React.ReactNode;
  }[];
}

interface KeyboardShortcutsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsOverlay = ({ isOpen, onClose }: KeyboardShortcutsOverlayProps) => {
  const [platform, setPlatform] = useState<'mac' | 'windows'>('windows');

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('mac')) {
      setPlatform('mac');
    }
  }, []);

  const getModifierKey = () => platform === 'mac' ? '⌘' : 'Ctrl';
  const getAltKey = () => platform === 'mac' ? '⌥' : 'Alt';

  const shortcuts: KeyboardShortcut[] = [
    {
      category: 'Navigation',
      shortcuts: [
        {
          keys: [getModifierKey(), 'K'],
          description: 'Open search',
          icon: <Search className="w-4 h-4" />
        },
        {
          keys: ['G', 'D'],
          description: 'Go to Dashboard',
          icon: <LayoutGrid className="w-4 h-4" />
        },
        {
          keys: ['G', 'A'],
          description: 'Go to Analytics',
          icon: <Calendar className="w-4 h-4" />
        },
        {
          keys: ['G', 'R'],
          description: 'Go to Rules',
          icon: <Settings className="w-4 h-4" />
        },
        {
          keys: ['?'],
          description: 'Show keyboard shortcuts',
          icon: <Keyboard className="w-4 h-4" />
        }
      ]
    },
    {
      category: 'Views',
      shortcuts: [
        {
          keys: ['V', 'G'],
          description: 'Switch to Gantt view',
          icon: <Calendar className="w-4 h-4" />
        },
        {
          keys: ['V', 'C'],
          description: 'Switch to Card view',
          icon: <LayoutGrid className="w-4 h-4" />
        },
        {
          keys: ['V', 'L'],
          description: 'Switch to Calendar view',
          icon: <Calendar className="w-4 h-4" />
        },
        {
          keys: ['V', 'S'],
          description: 'Switch to Shift view',
          icon: <Users className="w-4 h-4" />
        },
        {
          keys: ['V', 'X'],
          description: 'Switch to Conflicts view',
          icon: <Zap className="w-4 h-4" />
        }
      ]
    },
    {
      category: 'Filters',
      shortcuts: [
        {
          keys: ['F', 'P'],
          description: 'Filter by pending jobs',
          icon: <Zap className="w-4 h-4" />
        },
        {
          keys: ['F', 'I'],
          description: 'Filter by in-progress jobs',
          icon: <Zap className="w-4 h-4" />
        },
        {
          keys: ['F', 'C'],
          description: 'Filter by completed jobs',
          icon: <Zap className="w-4 h-4" />
        },
        {
          keys: ['F', 'D'],
          description: 'Filter by delayed jobs',
          icon: <Zap className="w-4 h-4" />
        },
        {
          keys: [getModifierKey(), 'Shift', 'F'],
          description: 'Clear all filters'
        }
      ]
    },
    {
      category: 'Actions',
      shortcuts: [
        {
          keys: [getModifierKey(), 'S'],
          description: 'Save current view'
        },
        {
          keys: [getModifierKey(), 'R'],
          description: 'Refresh data'
        },
        {
          keys: [getModifierKey(), 'Z'],
          description: 'Undo last action'
        },
        {
          keys: [getModifierKey(), 'Y'],
          description: 'Redo last action'
        },
        {
          keys: ['N'],
          description: 'Create new job'
        }
      ]
    },
    {
      category: 'Calendar Navigation',
      shortcuts: [
        {
          keys: ['←'],
          description: 'Previous day/week/month',
          icon: <ArrowLeft className="w-4 h-4" />
        },
        {
          keys: ['→'],
          description: 'Next day/week/month',
          icon: <ArrowRight className="w-4 h-4" />
        },
        {
          keys: ['T'],
          description: 'Go to today'
        },
        {
          keys: ['1'],
          description: 'Switch to day view'
        },
        {
          keys: ['2'],
          description: 'Switch to week view'
        },
        {
          keys: ['3'],
          description: 'Switch to month view'
        }
      ]
    },
    {
      category: 'General',
      shortcuts: [
        {
          keys: ['Esc'],
          description: 'Close modals/overlays'
        },
        {
          keys: ['Tab'],
          description: 'Navigate between elements'
        },
        {
          keys: ['Enter'],
          description: 'Confirm/select'
        },
        {
          keys: ['Space'],
          description: 'Toggle selection'
        }
      ]
    }
  ];

  const KeyBadge = ({ keys }: { keys: string[] }) => (
    <div className="flex items-center gap-1">
      {keys.map((key, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="text-muted-foreground text-xs">+</span>}
          <Badge variant="outline" className="px-2 py-1 text-xs font-mono bg-muted/50">
            {key}
          </Badge>
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
            <Badge variant="secondary" className="ml-2">
              {platform === 'mac' ? 'macOS' : 'Windows/Linux'}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-96">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shortcuts.map((category, categoryIndex) => (
              <div key={category.category} className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  {category.category}
                </h3>
                <div className="space-y-2">
                  {category.shortcuts.map((shortcut, shortcutIndex) => (
                    <div 
                      key={shortcutIndex}
                      className="flex items-center justify-between gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {shortcut.icon}
                        <span className="text-sm truncate">{shortcut.description}</span>
                      </div>
                      <KeyBadge keys={shortcut.keys} />
                    </div>
                  ))}
                </div>
                {categoryIndex < shortcuts.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Press <Badge variant="outline" className="mx-1 px-2 py-1 text-xs">?</Badge> anytime to show this help
          </div>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Hook to handle global keyboard shortcuts
export const useKeyboardShortcuts = (
  onShowHelp: () => void,
  onSearch: () => void,
  callbacks?: {
    onNavigate?: (path: string) => void;
    onViewChange?: (view: string) => void;
    onFilterChange?: (filter: string) => void;
    onAction?: (action: string) => void;
  }
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        // Allow some shortcuts even in inputs
        if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
          event.preventDefault();
          onSearch();
        }
        return;
      }

      // Help
      if (event.key === '?') {
        event.preventDefault();
        onShowHelp();
      }

      // Search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        onSearch();
      }

      // Navigation shortcuts
      if (callbacks?.onNavigate) {
        if (event.key === 'g') {
          // Wait for next key
          const handleSecondKey = (e: KeyboardEvent) => {
            e.preventDefault();
            switch (e.key) {
              case 'd':
                callbacks.onNavigate?.('/');
                break;
              case 'a':
                callbacks.onNavigate?.('/analytics');
                break;
              case 'r':
                callbacks.onNavigate?.('/rules');
                break;
            }
            document.removeEventListener('keydown', handleSecondKey);
          };
          document.addEventListener('keydown', handleSecondKey, { once: true });
        }
      }

      // View shortcuts
      if (callbacks?.onViewChange) {
        if (event.key === 'v') {
          const handleSecondKey = (e: KeyboardEvent) => {
            e.preventDefault();
            switch (e.key) {
              case 'g':
                callbacks.onViewChange?.('gantt');
                break;
              case 'c':
                callbacks.onViewChange?.('card');
                break;
              case 'l':
                callbacks.onViewChange?.('calendar');
                break;
              case 's':
                callbacks.onViewChange?.('shift');
                break;
              case 'x':
                callbacks.onViewChange?.('conflicts');
                break;
            }
            document.removeEventListener('keydown', handleSecondKey);
          };
          document.addEventListener('keydown', handleSecondKey, { once: true });
        }

        // Quick view switches
        if (event.key >= '1' && event.key <= '5') {
          const views = ['gantt', 'card', 'calendar', 'shift', 'conflicts'];
          const viewIndex = parseInt(event.key) - 1;
          if (views[viewIndex]) {
            callbacks.onViewChange?.(views[viewIndex]);
          }
        }
      }

      // Filter shortcuts
      if (callbacks?.onFilterChange) {
        if (event.key === 'f') {
          const handleSecondKey = (e: KeyboardEvent) => {
            e.preventDefault();
            switch (e.key) {
              case 'p':
                callbacks.onFilterChange?.('status:pending');
                break;
              case 'i':
                callbacks.onFilterChange?.('status:in-progress');
                break;
              case 'c':
                callbacks.onFilterChange?.('status:completed');
                break;
              case 'd':
                callbacks.onFilterChange?.('status:delayed');
                break;
            }
            document.removeEventListener('keydown', handleSecondKey);
          };
          document.addEventListener('keydown', handleSecondKey, { once: true });
        }
      }

      // Action shortcuts
      if (callbacks?.onAction) {
        if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'F') {
          event.preventDefault();
          callbacks.onAction?.('clear-filters');
        }
        
        if ((event.metaKey || event.ctrlKey) && event.key === 's') {
          event.preventDefault();
          callbacks.onAction?.('save');
        }
        
        if ((event.metaKey || event.ctrlKey) && event.key === 'r') {
          event.preventDefault();
          callbacks.onAction?.('refresh');
        }
        
        if (event.key === 'n' && !event.metaKey && !event.ctrlKey) {
          event.preventDefault();
          callbacks.onAction?.('new-job');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onShowHelp, onSearch, callbacks]);
};