
import { useEffect } from 'react';

export const useResizeObserver = (
  containerRef: React.RefObject<HTMLDivElement>,
  days: number,
  setCellWidth: (width: number) => void
) => {
  useEffect(() => {
    if (containerRef.current) {
      const observer = new ResizeObserver(() => {
        if (containerRef.current && days > 0) {
          const availableWidth = containerRef.current.clientWidth - 200; // Subtract header width
          const newCellWidth = Math.max(80, Math.min(120, availableWidth / days)); // Min 80px, max 120px
          setCellWidth(newCellWidth);
        }
      });
      
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [containerRef, days, setCellWidth]);
};
