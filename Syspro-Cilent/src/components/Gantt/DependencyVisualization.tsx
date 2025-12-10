import React, { useEffect, useRef } from 'react';
import { Job, Machine } from '@/types/jobs';

interface DependencyVisualizationProps {
  jobs: Job[];
  machines: Machine[];
  containerRef: React.RefObject<HTMLElement>;
  className?: string;
}

export const DependencyVisualization = ({ jobs, machines, containerRef, className }: DependencyVisualizationProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    drawDependencies();
  }, [jobs, machines]);

  const drawDependencies = () => {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container) return;

    svg.innerHTML = '';

    jobs.forEach(job => {
      if (!job.dependencies || job.dependencies.length === 0) return;

      job.dependencies.forEach(depId => {
        const sourceElement = container.querySelector(`[data-job-id="${depId}"]`) as HTMLElement;
        const targetElement = container.querySelector(`[data-job-id="${job.id}"]`) as HTMLElement;
        
        if (!sourceElement || !targetElement) return;

        const sourceRect = sourceElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const startX = sourceRect.right - containerRect.left;
        const startY = sourceRect.top + sourceRect.height / 2 - containerRect.top;
        const endX = targetRect.left - containerRect.left;
        const endY = targetRect.top + targetRect.height / 2 - containerRect.top;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const midX = startX + (endX - startX) / 2;
        
        path.setAttribute('d', `M ${startX} ${startY} Q ${midX} ${startY} ${midX} ${(startY + endY) / 2} Q ${midX} ${endY} ${endX - 8} ${endY}`);
        path.setAttribute('stroke', '#3b82f6');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.setAttribute('marker-end', 'url(#arrowhead)');
        path.classList.add('dependency-arrow');

        svg.appendChild(path);
      });
    });
  };

  return (
    <svg
      ref={svgRef}
      className={`absolute inset-0 pointer-events-none z-10 ${className || ''}`}
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
        </marker>
      </defs>
    </svg>
  );
};
