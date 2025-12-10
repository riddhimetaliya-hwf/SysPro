
import React, { useState } from 'react';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { Card, CardContent } from '@/components/UI/card';
import { toast } from 'sonner';
import { AlertTriangle, Clock, Palette, Plus, Save, Tag } from 'lucide-react';

type PriorityConfig = {
  label: string;
  color: string;
};

type StatusConfig = {
  label: string;
  color: string;
};

type CategoryConfig = {
  label: string;
  color: string;
  icon: string;
};

export const ColorLabelConfig = () => {
  const [priorities, setPriorities] = useState<PriorityConfig[]>([
    { label: 'High', color: '#EF4444' },
    { label: 'Medium', color: '#F59E0B' },
    { label: 'Low', color: '#10B981' }
  ]);
  
  const [statuses, setStatuses] = useState<StatusConfig[]>([
    { label: 'Not Started', color: '#94A3B8' },
    { label: 'In Progress', color: '#3B82F6' },
    { label: 'On Hold', color: '#F59E0B' },
    { label: 'Completed', color: '#10B981' }
  ]);
  
  const [categories, setCategories] = useState<CategoryConfig[]>([
    { label: 'Design', color: '#8B5CF6', icon: '🎨' },
    { label: 'Development', color: '#3B82F6', icon: '💻' },
    { label: 'Testing', color: '#F59E0B', icon: '🧪' },
    { label: 'Deployment', color: '#10B981', icon: '🚀' }
  ]);
  
  const [newPriority, setNewPriority] = useState<PriorityConfig>({ label: '', color: '#6366F1' });
  const [newStatus, setNewStatus] = useState<StatusConfig>({ label: '', color: '#6366F1' });
  const [newCategory, setNewCategory] = useState<CategoryConfig>({ label: '', color: '#6366F1', icon: '📌' });
  
  const handleSaveChanges = () => {
    toast.success('Color and label configuration saved successfully');
  };
  
  const handleAddPriority = () => {
    if (!newPriority.label) {
      toast.error('Please enter a priority label');
      return;
    }
    
    setPriorities([...priorities, {...newPriority}]);
    setNewPriority({ label: '', color: '#6366F1' });
    toast.success('Priority added successfully');
  };
  
  const handleAddStatus = () => {
    if (!newStatus.label) {
      toast.error('Please enter a status label');
      return;
    }
    
    setStatuses([...statuses, {...newStatus}]);
    setNewStatus({ label: '', color: '#6366F1' });
    toast.success('Status added successfully');
  };
  
  const handleAddCategory = () => {
    if (!newCategory.label) {
      toast.error('Please enter a category label');
      return;
    }
    
    setCategories([...categories, {...newCategory}]);
    setNewCategory({ label: '', color: '#6366F1', icon: '📌' });
    toast.success('Category added successfully');
  };
  
  const emojiOptions = ['📌', '🎯', '🔍', '🚀', '💡', '🔧', '📊', '📈', '🧩', '🎨', '💻', '🧪', '📱', '⚙️', '📝'];
  
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Color & Label Configuration</h2>
        <p className="text-muted-foreground">Customize priority levels, status labels, and categories</p>
      </div>
      
      <Tabs defaultValue="priority" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1.5">
          <TabsTrigger value="priority" className="flex items-center gap-2 py-2.5">
            <AlertTriangle size={14} />
            Priority Levels
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2 py-2.5">
            <Clock size={14} />
            Status Labels
          </TabsTrigger>
          <TabsTrigger value="category" className="flex items-center gap-2 py-2.5">
            <Tag size={14} />
            Categories
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="priority" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {priorities.map((priority, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-md">
                    <div 
                      className="w-6 h-6 rounded" 
                      style={{ backgroundColor: priority.color }}
                    />
                    <span className="font-medium">{priority.label}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 items-end border-t pt-4">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="newPriorityLabel">New Priority Label</Label>
                  <Input
                    id="newPriorityLabel"
                    placeholder="e.g., Critical"
                    value={newPriority.label}
                    onChange={(e) => setNewPriority({...newPriority, label: e.target.value})}
                  />
                </div>
                <div className="space-y-2 w-full md:w-auto">
                  <Label htmlFor="newPriorityColor">Color</Label>
                  <Input
                    id="newPriorityColor"
                    type="color"
                    value={newPriority.color}
                    onChange={(e) => setNewPriority({...newPriority, color: e.target.value})}
                    className="w-full md:w-20 h-10 p-1"
                  />
                </div>
                <Button onClick={handleAddPriority} className="w-full md:w-auto">
                  <Plus size={16} className="mr-2" />
                  Add Priority
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {statuses.map((status, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-md">
                    <div 
                      className="w-6 h-6 rounded" 
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="font-medium">{status.label}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 items-end border-t pt-4">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="newStatusLabel">New Status Label</Label>
                  <Input
                    id="newStatusLabel"
                    placeholder="e.g., Under Review"
                    value={newStatus.label}
                    onChange={(e) => setNewStatus({...newStatus, label: e.target.value})}
                  />
                </div>
                <div className="space-y-2 w-full md:w-auto">
                  <Label htmlFor="newStatusColor">Color</Label>
                  <Input
                    id="newStatusColor"
                    type="color"
                    value={newStatus.color}
                    onChange={(e) => setNewStatus({...newStatus, color: e.target.value})}
                    className="w-full md:w-20 h-10 p-1"
                  />
                </div>
                <Button onClick={handleAddStatus} className="w-full md:w-auto">
                  <Plus size={16} className="mr-2" />
                  Add Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="category" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {categories.map((category, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-md">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full text-lg"
                      style={{ backgroundColor: category.color }}>
                      {category.icon}
                    </div>
                    <span className="font-medium">{category.label}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 items-end border-t pt-4">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="newCategoryLabel">New Category Label</Label>
                  <Input
                    id="newCategoryLabel"
                    placeholder="e.g., Marketing"
                    value={newCategory.label}
                    onChange={(e) => setNewCategory({...newCategory, label: e.target.value})}
                  />
                </div>
                <div className="space-y-2 w-full md:w-auto">
                  <Label htmlFor="newCategoryColor">Color</Label>
                  <Input
                    id="newCategoryColor"
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({...newCategory, color: e.target.value})}
                    className="w-full md:w-20 h-10 p-1"
                  />
                </div>
                <div className="space-y-2 w-full md:w-auto">
                  <Label htmlFor="newCategoryIcon">Icon</Label>
                  <select
                    id="newCategoryIcon"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={newCategory.icon}
                    onChange={(e) => setNewCategory({...newCategory, icon: e.target.value})}
                  >
                    {emojiOptions.map((emoji) => (
                      <option key={emoji} value={emoji}>{emoji}</option>
                    ))}
                  </select>
                </div>
                <Button onClick={handleAddCategory} className="w-full md:w-auto">
                  <Plus size={16} className="mr-2" />
                  Add Category
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button onClick={handleSaveChanges}>
          <Save size={16} className="mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};
