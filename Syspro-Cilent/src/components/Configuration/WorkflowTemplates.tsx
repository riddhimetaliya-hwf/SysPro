
import React, { useState } from 'react';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/UI/dialog';
import { Clock, Edit, FileText, Plus, Save, Trash, Workflow } from 'lucide-react';

type TaskTemplate = {
  id: string;
  name: string;
  defaultDuration: number; // in hours
  category: string;
  defaultStatus: string;
};

export const WorkflowTemplates = () => {
  const [templates, setTemplates] = useState<TaskTemplate[]>([
    { id: '1', name: 'Design Phase', defaultDuration: 24, category: 'Design', defaultStatus: 'Not Started' },
    { id: '2', name: 'Development Task', defaultDuration: 40, category: 'Development', defaultStatus: 'Not Started' },
    { id: '3', name: 'QA Testing', defaultDuration: 16, category: 'Testing', defaultStatus: 'Not Started' }
  ]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<TaskTemplate>({
    id: '', name: '', defaultDuration: 8, category: 'General', defaultStatus: 'Not Started'
  });
  const [isEditing, setIsEditing] = useState(false);
  
  const categoryOptions = ['Design', 'Development', 'Testing', 'Deployment', 'General'];
  const statusOptions = ['Not Started', 'In Progress', 'Review', 'Completed'];
  
  const handleOpenDialog = (template?: TaskTemplate) => {
    if (template) {
      setCurrentTemplate(template);
      setIsEditing(true);
    } else {
      setCurrentTemplate({
        id: '', name: '', defaultDuration: 8, category: 'General', defaultStatus: 'Not Started'
      });
      setIsEditing(false);
    }
    setIsDialogOpen(true);
  };
  
  const handleSaveTemplate = () => {
    if (!currentTemplate.name) {
      toast.error('Please enter a template name');
      return;
    }
    
    if (isEditing) {
      setTemplates(templates.map(temp => 
        temp.id === currentTemplate.id ? currentTemplate : temp
      ));
      toast.success('Template updated successfully');
    } else {
      const newTemplate = {
        ...currentTemplate,
        id: Date.now().toString()
      };
      setTemplates([...templates, newTemplate]);
      toast.success('Template created successfully');
    }
    
    setIsDialogOpen(false);
  };
  
  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(temp => temp.id !== id));
    toast.success('Template deleted successfully');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Workflow Templates</h2>
          <p className="text-muted-foreground">Create and manage task templates</p>
        </div>
        
        <Button onClick={() => handleOpenDialog()}>
          <Plus size={16} className="mr-2" />
          New Template
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <Badge variant="outline">{template.category}</Badge>
              </div>
              <CardDescription className="flex items-center gap-1">
                <Clock size={14} />
                {template.defaultDuration} hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm mb-4">
                Default Status: <Badge variant="secondary">{template.defaultStatus}</Badge>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpenDialog(template)}>
                  <Edit size={14} className="mr-1" />
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteTemplate(template.id)}>
                  <Trash size={14} className="text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {templates.length === 0 && (
        <div className="text-center p-8 border rounded-lg bg-muted/20">
          <Workflow className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="font-medium text-lg mb-1">No Templates Yet</h3>
          <p className="text-muted-foreground mb-4">Create your first workflow template to get started</p>
          <Button onClick={() => handleOpenDialog()}>
            <Plus size={16} className="mr-2" />
            New Template
          </Button>
        </div>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Template' : 'Create New Template'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                placeholder="e.g., Design Phase"
                value={currentTemplate.name}
                onChange={(e) => setCurrentTemplate({...currentTemplate, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={currentTemplate.category} 
                onValueChange={(value) => setCurrentTemplate({...currentTemplate, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Default Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                value={currentTemplate.defaultDuration}
                onChange={(e) => setCurrentTemplate({
                  ...currentTemplate, 
                  defaultDuration: parseInt(e.target.value) || 1
                })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Default Status</Label>
              <Select 
                value={currentTemplate.defaultStatus} 
                onValueChange={(value) => setCurrentTemplate({...currentTemplate, defaultStatus: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTemplate}>
              <Save size={16} className="mr-2" />
              {isEditing ? 'Update Template' : 'Save Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
