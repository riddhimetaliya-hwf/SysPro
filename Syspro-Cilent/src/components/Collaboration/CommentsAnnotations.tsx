
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MessageCircle, Reply, Check, MoreHorizontal, Pin } from "lucide-react";
import { toast } from "sonner";

interface Comment {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  timestamp: Date;
  resolved: boolean;
  replies?: Comment[];
  position: { x: number; y: number };
  jobId?: string;
}

interface CommentsAnnotationsProps {
  jobId?: string;
  onAddComment?: (comment: Omit<Comment, 'id' | 'timestamp'>) => void;
}

export const CommentsAnnotations = ({ jobId, onAddComment }: CommentsAnnotationsProps) => {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: 'Sarah Chen',
      content: 'This job has a material dependency that might delay the start time.',
      timestamp: new Date(Date.now() - 3600000),
      resolved: false,
      position: { x: 200, y: 100 },
      jobId: 'job-1'
    },
    {
      id: '2',
      author: 'Mike Johnson',
      content: 'Machine A needs calibration before this job can start.',
      timestamp: new Date(Date.now() - 1800000),
      resolved: false,
      position: { x: 350, y: 150 },
      jobId: 'job-2'
    }
  ]);

  const [newComment, setNewComment] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{ x: number; y: number } | null>(null);

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedPosition) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: 'Current User',
      content: newComment,
      timestamp: new Date(),
      resolved: false,
      position: selectedPosition,
      jobId
    };

    setComments(prev => [...prev, comment]);
    onAddComment?.(comment);
    setNewComment('');
    setShowCommentForm(false);
    setSelectedPosition(null);
    toast.success('Comment added successfully');
  };

  const handleResolveComment = (commentId: string) => {
    setComments(prev => prev.map(comment =>
      comment.id === commentId ? { ...comment, resolved: !comment.resolved } : comment
    ));
    toast.success('Comment resolved');
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    setSelectedPosition(position);
    setShowCommentForm(true);
  };

  return (
    <div className="relative w-full h-full">
      {/* Comment Pins */}
      {comments.map(comment => (
        <div
          key={comment.id}
          className="absolute z-10 group"
          style={{
            left: comment.position.x,
            top: comment.position.y,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <Button
            size="sm"
            variant={comment.resolved ? "secondary" : "default"}
            className="rounded-full w-8 h-8 p-0 shadow-lg hover:scale-110 transition-transform"
          >
            <MessageCircle size={14} />
          </Button>
          
          {/* Comment Popup */}
          <Card className="absolute left-8 top-0 w-80 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">
                      {comment.author.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{comment.author}</span>
                  <span className="text-xs text-muted-foreground">
                    {comment.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                {comment.resolved && (
                  <Badge variant="secondary" className="text-xs">Resolved</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm mb-3">{comment.content}</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleResolveComment(comment.id)}
                  className="text-xs"
                >
                  <Check size={12} className="mr-1" />
                  {comment.resolved ? 'Unresolve' : 'Resolve'}
                </Button>
                <Button size="sm" variant="ghost" className="text-xs">
                  <Reply size={12} className="mr-1" />
                  Reply
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}

      {/* New Comment Form */}
      {showCommentForm && selectedPosition && (
        <div
          className="absolute z-20"
          style={{
            left: selectedPosition.x,
            top: selectedPosition.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <Card className="w-80 shadow-lg">
            <CardContent className="p-4">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-3"
                rows={3}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowCommentForm(false);
                    setSelectedPosition(null);
                    setNewComment('');
                  }}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAddComment}>
                  Add Comment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Invisible overlay for clicking */}
      <div
        className="absolute inset-0 cursor-crosshair"
        onClick={handleCanvasClick}
      />
    </div>
  );
};
