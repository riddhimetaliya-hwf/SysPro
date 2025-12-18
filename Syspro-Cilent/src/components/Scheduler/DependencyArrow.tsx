
import React from 'react';

interface DependencyArrowProps {
  fromRect: DOMRect;
  toRect: DOMRect;
  containerRect: DOMRect;
}

export const DependencyArrow = ({ fromRect, toRect, containerRect }: DependencyArrowProps) => {
  // Calculate relative positions
  const fromX = fromRect.right - containerRect.left;
  const fromY = fromRect.top + fromRect.height / 2 - containerRect.top;
  const toX = toRect.left - containerRect.left;
  const toY = toRect.top + toRect.height / 2 - containerRect.top;

  // Calculate control points for curved arrow
  const controlOffset = Math.min(100, Math.abs(toX - fromX) / 2);
  const controlX1 = fromX + controlOffset;
  const controlX2 = toX - controlOffset;

  const pathData = `M ${fromX} ${fromY} C ${controlX1} ${fromY}, ${controlX2} ${toY}, ${toX - 8} ${toY}`;

  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none z-10"
      style={{
        width: containerRect.width,
        height: containerRect.height,
      }}
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
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="rgba(59, 130, 246, 0.8)"
          />
        </marker>
      </defs>
      <path
        d={pathData}
        stroke="rgba(59, 130, 246, 0.8)"
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)"
        className="drop-shadow-sm"
      />
    </svg>
  );
};
