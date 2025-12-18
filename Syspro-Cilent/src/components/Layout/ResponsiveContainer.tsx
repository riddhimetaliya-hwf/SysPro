import React, { ReactNode, useEffect, useState } from 'react';
import { useWindowSize } from '@/hooks/useWindowSize';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
}

export const ResponsiveContainer = ({ children, className = '' }: ResponsiveContainerProps) => {
  const { width, height } = useWindowSize();
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'laptop' | 'desktop'>('desktop');

  useEffect(() => {
    if (width < 640) {
      setBreakpoint('mobile');
    } else if (width < 768) {
      setBreakpoint('mobile');
    } else if (width < 1024) {
      setBreakpoint('tablet');
    } else if (width < 1280) {
      setBreakpoint('laptop');
    } else {
      setBreakpoint('desktop');
    }
  }, [width]);

  const getResponsiveClass = () => {
    switch (breakpoint) {
      case 'mobile':
        return 'responsive-mobile touch-manipulation';
      case 'tablet':
        return 'responsive-tablet touch-optimized-gantt';
      case 'laptop':
        return 'responsive-laptop';
      default:
        return 'responsive-desktop';
    }
  };

  return (
    <div 
      className={`${getResponsiveClass()} ${className}`}
      style={{
        '--viewport-width': `${width}px`,
        '--viewport-height': `${height}px`,
        '--breakpoint': breakpoint,
      } as React.CSSProperties}
      data-breakpoint={breakpoint}
    >
      {children}
    </div>
  );
};
