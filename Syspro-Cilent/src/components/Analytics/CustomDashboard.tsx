
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Badge } from '@/components/UI/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Plus, Settings, Eye, EyeOff, Trash2 } from 'lucide-react';
import { PerformanceMetrics } from './PerformanceMetrics';

interface Widget {
  id: string;
  type: 'metric' | 'chart' | 'list' | 'status';
  title: string;
  size: 'small' | 'medium' | 'large';
  visible: boolean;
  config?: any;
}

interface Dashboard {
  id: string;
  name: string;
  widgets: Widget[];
}

export const CustomDashboard = () => {
  const [dashboards, setDashboards] = useState<Dashboard[]>([
    {
      id: 'operations',
      name: 'Operations Overview',
      widgets: [
        { id: '1', type: 'metric', title: 'Machine Utilization', size: 'small', visible: true },
        { id: '2', type: 'chart', title: 'Hourly Production', size: 'medium', visible: true },
        { id: '3', type: 'list', title: 'Active Jobs', size: 'medium', visible: true },
        { id: '4', type: 'status', title: 'System Status', size: 'small', visible: true },
      ]
    },
    {
      id: 'maintenance',
      name: 'Maintenance Dashboard',
      widgets: [
        { id: '5', type: 'metric', title: 'Equipment Health', size: 'small', visible: true },
        { id: '6', type: 'chart', title: 'Maintenance Schedule', size: 'large', visible: true },
        { id: '7', type: 'list', title: 'Upcoming Maintenance', size: 'medium', visible: true },
      ]
    }
  ]);

  const [activeDashboard, setActiveDashboard] = useState('operations');
  const [editMode, setEditMode] = useState(false);

  const availableWidgets = [
    { type: 'metric', title: 'KPI Metric', description: 'Single value with trend' },
    { type: 'chart', title: 'Chart Widget', description: 'Visual data representation' },
    { type: 'list', title: 'Data List', description: 'Tabular data display' },
    { type: 'status', title: 'Status Widget', description: 'System status indicators' },
  ];

  const currentDashboard = dashboards.find(d => d.id === activeDashboard);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const dashboard = dashboards.find(d => d.id === activeDashboard);
    if (!dashboard) return;

    const widgets = Array.from(dashboard.widgets);
    const [reorderedWidget] = widgets.splice(result.source.index, 1);
    widgets.splice(result.destination.index, 0, reorderedWidget);

    setDashboards(prev => prev.map(d => 
      d.id === activeDashboard ? { ...d, widgets } : d
    ));
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    setDashboards(prev => prev.map(dashboard => 
      dashboard.id === activeDashboard 
        ? {
            ...dashboard,
            widgets: dashboard.widgets.map(widget =>
              widget.id === widgetId ? { ...widget, visible: !widget.visible } : widget
            )
          }
        : dashboard
    ));
  };

  const addWidget = (type: string) => {
    const newWidget: Widget = {
      id: Date.now().toString(),
      type: type as Widget['type'],
      title: `New ${type} Widget`,
      size: 'medium',
      visible: true
    };

    setDashboards(prev => prev.map(dashboard =>
      dashboard.id === activeDashboard
        ? { ...dashboard, widgets: [...dashboard.widgets, newWidget] }
        : dashboard
    ));
  };

  const removeWidget = (widgetId: string) => {
    setDashboards(prev => prev.map(dashboard =>
      dashboard.id === activeDashboard
        ? { ...dashboard, widgets: dashboard.widgets.filter(w => w.id !== widgetId) }
        : dashboard
    ));
  };

  const renderWidget = (widget: Widget) => {
    if (!widget.visible) return null;

    const sizeClasses = {
      small: 'col-span-1',
      medium: 'col-span-2',
      large: 'col-span-3'
    };

    return (
      <Card key={widget.id} className={`${sizeClasses[widget.size]} min-h-[200px]`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">{widget.title}</CardTitle>
            {editMode && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleWidgetVisibility(widget.id)}
                >
                  {widget.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeWidget(widget.id)}
                >
                  <Trash2 size={14} />
                </Button>
                <GripVertical size={14} className="text-muted-foreground cursor-grab" />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {widget.type === 'metric' && (
            <div>
              <div className="text-2xl font-bold">85.2%</div>
              <div className="text-sm text-muted-foreground">+2.1% from last week</div>
            </div>
          )}
          {widget.type === 'chart' && (
            <div className="h-32 bg-muted/20 rounded flex items-center justify-center text-muted-foreground">
              Chart Visualization
            </div>
          )}
          {widget.type === 'list' && (
            <div className="space-y-2">
              {['Job #12345', 'Job #12346', 'Job #12347'].map(job => (
                <div key={job} className="flex justify-between text-sm">
                  <span>{job}</span>
                  <Badge variant="outline">Active</Badge>
                </div>
              ))}
            </div>
          )}
          {widget.type === 'status' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">All Systems Operational</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span className="text-sm">1 Warning</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Tabs and Controls */}
      <div className="flex items-center justify-between">
        <Tabs value={activeDashboard} onValueChange={setActiveDashboard}>
          <TabsList>
            {dashboards.map(dashboard => (
              <TabsTrigger key={dashboard.id} value={dashboard.id}>
                {dashboard.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-2">
          <Button
            variant={editMode ? "default" : "outline"}
            size="sm"
            onClick={() => setEditMode(!editMode)}
          >
            <Settings size={16} className="mr-2" />
            {editMode ? 'Done' : 'Edit'}
          </Button>
        </div>
      </div>

      {/* Widget Management */}
      {editMode && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Widgets</CardTitle>
            <CardDescription>Drag and drop widgets to customize your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {availableWidgets.map(widget => (
                <Card key={widget.type} className="cursor-pointer hover:bg-muted/50" onClick={() => addWidget(widget.type)}>
                  <CardContent className="p-4 text-center">
                    <Plus size={24} className="mx-auto mb-2 text-muted-foreground" />
                    <div className="font-medium text-sm">{widget.title}</div>
                    <div className="text-xs text-muted-foreground">{widget.description}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Content */}
      {currentDashboard && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="dashboard" direction="horizontal">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4"
              >
                {currentDashboard.widgets.map((widget, index) => (
                  <Draggable
                    key={widget.id}
                    draggableId={widget.id}
                    index={index}
                    isDragDisabled={!editMode}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        {renderWidget(widget)}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Performance Metrics Integration */}
      {activeDashboard === 'operations' && !editMode && (
        <div className="mt-8">
          <PerformanceMetrics />
        </div>
      )}
    </div>
  );
};
