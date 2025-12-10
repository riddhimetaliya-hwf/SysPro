
import { useState, useRef, useEffect } from 'react';

export const useTooltipPosition = () => {
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const jobRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Smart tooltip positioning that avoids overlaps
  const calculateOptimalPosition = (jobRect: DOMRect, tooltipRect: DOMRect) => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Define safe zones (avoid header, sidebar, and other UI elements)
    const headerHeight = 120; // Account for header and filters
    const sidebarWidth = 300; // Account for right sidebar
    const margin = 20;

    // Calculate available space in each direction
    const spaceAbove = jobRect.top - headerHeight;
    const spaceBelow = viewportHeight - jobRect.bottom - margin;
    const spaceLeft = jobRect.left - sidebarWidth;
    const spaceRight = viewportWidth - jobRect.right - sidebarWidth;

    let top = jobRect.top + scrollTop;
    let left = jobRect.left + scrollLeft;

    // Prioritize positioning: right > left > above > below
    if (spaceRight >= tooltipRect.width + margin) {
      // Position to the right
      left = jobRect.right + scrollLeft + margin;
      top = jobRect.top + scrollTop + (jobRect.height / 2) - (tooltipRect.height / 2);
    } else if (spaceLeft >= tooltipRect.width + margin) {
      // Position to the left
      left = jobRect.left + scrollLeft - tooltipRect.width - margin;
      top = jobRect.top + scrollTop + (jobRect.height / 2) - (tooltipRect.height / 2);
    } else if (spaceAbove >= tooltipRect.height + margin) {
      // Position above
      top = jobRect.top + scrollTop - tooltipRect.height - margin;
      left = jobRect.left + scrollLeft + (jobRect.width / 2) - (tooltipRect.width / 2);
    } else if (spaceBelow >= tooltipRect.height + margin) {
      // Position below
      top = jobRect.bottom + scrollTop + margin;
      left = jobRect.left + scrollLeft + (jobRect.width / 2) - (tooltipRect.width / 2);
    } else {
      // Fallback: floating position that doesn't interfere with UI
      top = Math.max(headerHeight + scrollTop, jobRect.top + scrollTop - tooltipRect.height - margin);
      left = Math.min(viewportWidth - tooltipRect.width - sidebarWidth - margin, jobRect.left + scrollLeft);
    }

    // Ensure tooltip stays within viewport bounds
    top = Math.max(headerHeight + scrollTop, Math.min(top, scrollTop + viewportHeight - tooltipRect.height - margin));
    left = Math.max(scrollLeft + margin, Math.min(left, scrollLeft + viewportWidth - tooltipRect.width - sidebarWidth - margin));

    return { top, left };
  };

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!jobRef.current || !tooltipRef.current || !isVisible) return;

    // Debounce position updates for performance
    requestAnimationFrame(() => {
      const jobRect = jobRef.current!.getBoundingClientRect();
      const tooltipRect = tooltipRef.current!.getBoundingClientRect();
      
      const position = calculateOptimalPosition(jobRect, tooltipRect);
      setTooltipPosition(position);
    });
  };

  return {
    tooltipPosition,
    isVisible,
    jobRef,
    tooltipRef,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave
  };
};
