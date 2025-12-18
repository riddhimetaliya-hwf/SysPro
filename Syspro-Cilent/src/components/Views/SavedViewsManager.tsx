
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BookmarkPlus, Bookmark, Share, Trash2, Tag, Calendar } from 'lucide-react';
import { FilterOptions } from '@/types/jobs';
import { toast } from 'sonner';

interface SavedView {
  id: string;
  name: string;
  description: string;
  filters: FilterOptions;
  tags: string[];
  createdAt: Date;
  shared: boolean;
  shareLink?: string;
}

interface SavedViewsManagerProps {
  currentFilters: FilterOptions;
  onApplyView: (filters: FilterOptions) => void;
}

export const SavedViewsManager = ({ currentFilters, onApplyView }: SavedViewsManagerProps) => {
  const [savedViews, setSavedViews] = useState<SavedView[]>([
    {
      id: '1',
      name: 'High Priority Jobs',
      description: 'All critical and high priority jobs across machines',
      filters: { 
        status: 'pending', 
        search: 'priority:high', 
        machine: null, 
        material: null,
        crewSkill: null,
        job: null,
        product: null
      },
      tags: ['priority', 'urgent'],
      createdAt: new Date('2024-01-15'),
      shared: false
    },
    {
      id: '2',
      name: 'Machine A Focus',
      description: 'All jobs scheduled on Machine A this week',
      filters: { 
        machine: 'machine-a', 
        status: null, 
        material: null, 
        search: '',
        crewSkill: null,
        job: null,
        product: null
      },
      tags: ['machine-a', 'weekly'],
      createdAt: new Date('2024-01-10'),
      shared: true,
      shareLink: 'https://app.example.com/views/machine-a-focus'
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [newView, setNewView] = useState({
    name: '',
    description: '',
    tags: ''
  });

  const saveCurrentView = () => {
    if (!newView.name.trim()) {
      toast.error('Please enter a view name');
      return;
    }

    const view: SavedView = {
      id: Date.now().toString(),
      name: newView.name,
      description: newView.description,
      filters: currentFilters,
      tags: newView.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      createdAt: new Date(),
      shared: false
    };

    setSavedViews(prev => [view, ...prev]);
    setNewView({ name: '', description: '', tags: '' });
    setIsCreating(false);
    toast.success('View saved successfully');
  };

  const deleteView = (id: string) => {
    setSavedViews(prev => prev.filter(view => view.id !== id));
    toast.success('View deleted');
  };

  const shareView = (view: SavedView) => {
    const shareLink = `https://app.example.com/views/${view.id}`;
    navigator.clipboard.writeText(shareLink);
    
    setSavedViews(prev => prev.map(v => 
      v.id === view.id ? { ...v, shared: true, shareLink } : v
    ));
    
    toast.success('Share link copied to clipboard');
  };

  const applyView = (view: SavedView) => {
    onApplyView(view.filters);
    toast.success(`Applied view: ${view.name}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Saved Views</h3>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button size="sm">
              <BookmarkPlus className="w-4 h-4 mr-1" />
              Save Current View
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Current View</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">View Name</Label>
                <Input
                  id="name"
                  placeholder="My Custom View"
                  value={newView.name}
                  onChange={(e) => setNewView(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this view shows..."
                  value={newView.description}
                  onChange={(e) => setNewView(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  placeholder="urgent, machine-a, weekly"
                  value={newView.tags}
                  onChange={(e) => setNewView(prev => ({ ...prev, tags: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={saveCurrentView} className="flex-1">
                  Save View
                </Button>
                <Button variant="outline" onClick={() => setIsCreating(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {savedViews.map(view => (
          <Card key={view.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Bookmark className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{view.name}</span>
                    {view.shared && (
                      <Badge variant="secondary" className="text-xs">
                        Shared
                      </Badge>
                    )}
                  </div>
                  {view.description && (
                    <p className="text-sm text-muted-foreground mb-2">{view.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{view.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => applyView(view)}
                  >
                    Apply
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => shareView(view)}
                  >
                    <Share className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteView(view.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              {view.tags.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  <Tag className="w-3 h-3 text-muted-foreground" />
                  {view.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {savedViews.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No saved views yet</p>
          <p className="text-sm">Save your current filters and settings for quick access</p>
        </div>
      )}
    </div>
  );
};
