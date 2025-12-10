import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { 
  Accessibility, 
  Eye, 
  Volume2, 
  Keyboard, 
  MousePointer,
  Type,
  Contrast,
  Focus
} from 'lucide-react';
import { toast } from 'sonner';

interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: number;
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  soundFeedback: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (updates: Partial<AccessibilitySettings>) => void;
  announceToScreenReader: (message: string) => void;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  reducedMotion: false,
  fontSize: 16,
  screenReader: false,
  keyboardNavigation: true,
  focusIndicators: true,
  soundFeedback: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider = ({ children }: AccessibilityProviderProps) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.warn('Failed to parse accessibility settings:', error);
      }
    }
  }, []);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // High contrast mode
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Font size
    root.style.setProperty('--base-font-size', `${settings.fontSize}px`);

    // Focus indicators
    if (settings.focusIndicators) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }

    // Save settings
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  // Keyboard navigation setup
  useEffect(() => {
    if (!settings.keyboardNavigation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip to main content (Alt + 1)
      if (e.altKey && e.code === 'Digit1') {
        e.preventDefault();
        const main = document.querySelector('main, [role="main"]') as HTMLElement;
        main?.focus();
        announceToScreenReader('Skipped to main content');
      }

      // Open accessibility panel (Alt + A)
      if (e.altKey && e.code === 'KeyA') {
        e.preventDefault();
        const accessibilityButton = document.querySelector('[aria-label="Accessibility settings"]') as HTMLElement;
        accessibilityButton?.click();
      }

      // Escape key handling
      if (e.key === 'Escape') {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && activeElement.closest('[role="dialog"]')) {
          // Close modal/dialog
          const closeButton = activeElement.closest('[role="dialog"]')?.querySelector('[aria-label="Close"]') as HTMLElement;
          closeButton?.click();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [settings.keyboardNavigation]);

  const updateSettings = (updates: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    
    // Announce changes
    const changedKeys = Object.keys(updates);
    changedKeys.forEach(key => {
      const value = updates[key as keyof AccessibilitySettings];
      announceToScreenReader(`${key} ${value ? 'enabled' : 'disabled'}`);
    });
  };

  const announceToScreenReader = (message: string) => {
    // Create or update ARIA live region
    let liveRegion = document.getElementById('accessibility-announcer');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'accessibility-announcer';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
    }
    
    // Clear and set new message
    liveRegion.textContent = '';
    setTimeout(() => {
      liveRegion!.textContent = message;
    }, 100);

    // Sound feedback
    if (settings.soundFeedback) {
      // Simple beep sound using Web Audio API
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      } catch (error) {
        // Fallback: no sound
      }
    }
  };

  const value: AccessibilityContextType = {
    settings,
    updateSettings,
    announceToScreenReader,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

// Accessibility Settings Panel
export const AccessibilityPanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { settings, updateSettings } = useAccessibility();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="w-5 h-5" />
            Accessibility Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Contrast className="w-4 h-4" />
              <Label htmlFor="high-contrast">High Contrast Mode</Label>
            </div>
            <Switch
              id="high-contrast"
              checked={settings.highContrast}
              onCheckedChange={(checked) => updateSettings({ highContrast: checked })}
            />
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MousePointer className="w-4 h-4" />
              <Label htmlFor="reduced-motion">Reduce Motion</Label>
            </div>
            <Switch
              id="reduced-motion"
              checked={settings.reducedMotion}
              onCheckedChange={(checked) => updateSettings({ reducedMotion: checked })}
            />
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              <Label>Font Size: {settings.fontSize}px</Label>
            </div>
            <Slider
              value={[settings.fontSize]}
              onValueChange={([value]) => updateSettings({ fontSize: value })}
              min={12}
              max={24}
              step={1}
              className="w-full"
            />
          </div>

          {/* Keyboard Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              <Label htmlFor="keyboard-nav">Enhanced Keyboard Navigation</Label>
            </div>
            <Switch
              id="keyboard-nav"
              checked={settings.keyboardNavigation}
              onCheckedChange={(checked) => updateSettings({ keyboardNavigation: checked })}
            />
          </div>

          {/* Focus Indicators */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Focus className="w-4 h-4" />
              <Label htmlFor="focus-indicators">Enhanced Focus Indicators</Label>
            </div>
            <Switch
              id="focus-indicators"
              checked={settings.focusIndicators}
              onCheckedChange={(checked) => updateSettings({ focusIndicators: checked })}
            />
          </div>

          {/* Sound Feedback */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              <Label htmlFor="sound-feedback">Sound Feedback</Label>
            </div>
            <Switch
              id="sound-feedback"
              checked={settings.soundFeedback}
              onCheckedChange={(checked) => updateSettings({ soundFeedback: checked })}
            />
          </div>

          {/* Keyboard Shortcuts */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Keyboard Shortcuts:</strong></p>
            <p>Alt + 1: Skip to main content</p>
            <p>Alt + A: Open accessibility settings</p>
            <p>Escape: Close dialogs</p>
          </div>

          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Accessibility Button Component
export const AccessibilityButton = () => {
  const [showPanel, setShowPanel] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowPanel(true)}
        aria-label="Accessibility settings"
        className="gap-2"
      >
        <Accessibility className="w-4 h-4" />
        <span className="sr-only">Open accessibility settings</span>
      </Button>
      <AccessibilityPanel isOpen={showPanel} onClose={() => setShowPanel(false)} />
    </>
  );
};