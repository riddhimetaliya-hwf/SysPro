
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  position: { x: number; y: number };
  lastActivity: Date;
}

interface LiveCursorsProps {
  currentUser: User;
  onPositionChange?: (position: { x: number; y: number }) => void;
}

export const LiveCursors = ({ currentUser, onPositionChange }: LiveCursorsProps) => {
  const [users, setUsers] = useState<User[]>([
    {
      id: '2',
      name: 'Sarah Chen',
      color: '#10B981',
      position: { x: 150, y: 200 },
      lastActivity: new Date()
    },
    {
      id: '3',
      name: 'Mike Johnson',
      color: '#3B82F6',
      position: { x: 300, y: 150 },
      lastActivity: new Date()
    }
  ]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = { x: e.clientX, y: e.clientY };
      onPositionChange?.(newPosition);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [onPositionChange]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {users.map(user => (
        <div
          key={user.id}
          className="absolute transition-all duration-150 ease-out pointer-events-none"
          style={{
            left: user.position.x,
            top: user.position.y,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="flex items-center gap-2 bg-white rounded-full shadow-lg px-2 py-1 border">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: user.color }}
            />
            <span className="text-xs font-medium">{user.name}</span>
          </div>
          <svg
            className="absolute -bottom-1 left-1/2 transform -translate-x-1/2"
            width="12"
            height="8"
            viewBox="0 0 12 8"
          >
            <path
              d="M6 0L12 8H0L6 0Z"
              fill={user.color}
            />
          </svg>
        </div>
      ))}
    </div>
  );
};
