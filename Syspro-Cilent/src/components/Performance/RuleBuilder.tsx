
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/UI/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/UI/textarea';
import { Settings, Plus, Trash2, Eye, Clock, Users, Zap, AlertTriangle, Copy, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Rule {
  id: string;
  name: string;
  type: 'machine' | 'shift' | 'capacity' | 'buffer' | 'priority' | 'maintenance';
  category: 'scheduling' | 'resource' | 'quality' | 'safety';
  condition: {
    field: string;
    operator: 'equals' | 'greater_than' | 'less_than' | 'between' | 'contains';
    value: any;
    unit?: string;
  };
  action: {
    type: 'delay' | 'block' | 'alert' | 'reschedule' | 'reassign';
    value: number;
    unit: 'minutes' | 'hours' | 'percent' | 'count';
  };
  priority: number;
  machineIds?: string[];
  shiftTypes?: string[];
  enabled: boolean;
  description: string;
  createdAt: Date;
}

interface RuleTemplate {
  id: string;
  name: string;
  description: string;
  icon: any;
  rule: Partial<Rule>;
}

export const RuleBuilder = () => {
  const [rules, setRules] = useState<Rule[]>([
    { 
      id: '1', 
      name: 'Machine Cooldown Period', 
      type: 'machine',
      category: 'resource',
      condition: {
        field: 'machine_last_job_end',
        operator: 'less_than',
        value: 30,
        unit: 'minutes'
      },
      action: {
        type: 'delay',
        value: 30,
        unit: 'minutes'
      },
      priority: 8,
      enabled: true,
      description: 'Enforce 30-minute cooldown between jobs on the same machine',
      createdAt: new Date()
    },
    { 
      id: '2', 
      name: 'Peak Hours Capacity Limit', 
      type: 'capacity',
      category: 'scheduling',
      condition: {
        field: 'time_slot',
        operator: 'between',
        value: [9, 17]
      },
      action: {
        type: 'alert',
        value: 5,
        unit: 'count'
      },
      priority: 6,
      shiftTypes: ['day', 'afternoon'],
      enabled: true,
      description: 'Limit concurrent jobs during peak business hours (9 AM - 5 PM)',
      createdAt: new Date()
    },
    { 
      id: '3', 
      name: 'Critical Job Priority', 
      type: 'priority',
      category: 'quality',
      condition: {
        field: 'job_priority',
        operator: 'equals',
        value: 'critical'
      },
      action: {
        type: 'reschedule',
        value: 0,
        unit: 'minutes'
      },
      priority: 10,
      enabled: true,
      description: 'Automatically prioritize critical jobs to earliest available slots',
      createdAt: new Date()
    }
  ]);

  const [ruleTemplates] = useState<RuleTemplate[]>([
    {
      id: 'template-1',
      name: 'Machine Maintenance Window',
      description: 'Block scheduling during maintenance periods',
      icon: Settings,
      rule: {
        type: 'maintenance',
        category: 'safety',
        condition: { field: 'maintenance_schedule', operator: 'equals', value: 'active' },
        action: { type: 'block', value: 100, unit: 'percent' },
        priority: 9
      }
    },
    {
      id: 'template-2',
      name: 'Operator Skill Match',
      description: 'Ensure jobs match operator qualifications',
      icon: Users,
      rule: {
        type: 'capacity',
        category: 'quality',
        condition: { field: 'operator_skill_level', operator: 'greater_than', value: 5 },
        action: { type: 'reassign', value: 1, unit: 'count' },
        priority: 7
      }
    },
    {
      id: 'template-3',
      name: 'Rush Order Fast Track',
      description: 'Prioritize urgent orders automatically',
      icon: Zap,
      rule: {
        type: 'priority',
        category: 'scheduling',
        condition: { field: 'order_type', operator: 'equals', value: 'rush' },
        action: { type: 'reschedule', value: 0, unit: 'minutes' },
        priority: 9
      }
    },
    {
      id: 'template-4',
      name: 'Setup Time Buffer',
      description: 'Add buffer time between different job types',
      icon: Clock,
      rule: {
        type: 'buffer',
        category: 'resource',
        condition: { field: 'job_type_change', operator: 'equals', value: true },
        action: { type: 'delay', value: 15, unit: 'minutes' },
        priority: 5
      }
    }
  ]);
  
  const [newRule, setNewRule] = useState<Partial<Rule>>({
    name: '',
    type: 'machine',
    category: 'scheduling',
    condition: {
      field: '',
      operator: 'equals',
      value: ''
    },
    action: {
      type: 'delay',
      value: 0,
      unit: 'minutes'
    },
    priority: 5,
    enabled: true,
    description: ''
  });

  const [activeTab, setActiveTab] = useState('rules');
  const [previewMode, setPreviewMode] = useState(false);

  const addRule = () => {
    if (!newRule.name || !newRule.condition?.field || !newRule.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const rule: Rule = {
      id: Date.now().toString(),
      name: newRule.name!,
      type: newRule.type!,
      category: newRule.category!,
      condition: newRule.condition!,
      action: newRule.action!,
      priority: newRule.priority!,
      machineIds: newRule.machineIds,
      shiftTypes: newRule.shiftTypes,
      enabled: newRule.enabled!,
      description: newRule.description!,
      createdAt: new Date()
    };

    setRules([...rules, rule]);
    setNewRule({
      name: '',
      type: 'machine',
      category: 'scheduling',
      condition: { field: '', operator: 'equals', value: '' },
      action: { type: 'delay', value: 0, unit: 'minutes' },
      priority: 5,
      enabled: true,
      description: ''
    });
    toast.success('Rule added successfully');
  };

  const deleteRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
    toast.success('Rule deleted');
  };

  const toggleRule = (id: string) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const updateRulePriority = (id: string, priority: number) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, priority } : rule
    ));
  };

  const duplicateRule = (id: string) => {
    const rule = rules.find(r => r.id === id);
    if (rule) {
      const duplicated: Rule = {
        ...rule,
        id: Date.now().toString(),
        name: `${rule.name} (Copy)`,
        createdAt: new Date()
      };
      setRules([...rules, duplicated]);
      toast.success('Rule duplicated');
    }
  };

  const applyTemplate = (template: RuleTemplate) => {
    const rule: Rule = {
      id: Date.now().toString(),
      name: template.name,
      type: template.rule.type || 'machine',
      category: template.rule.category || 'scheduling',
      condition: template.rule.condition || { field: '', operator: 'equals', value: '' },
      action: template.rule.action || { type: 'delay', value: 0, unit: 'minutes' },
      priority: template.rule.priority || 5,
      enabled: true,
      description: template.description,
      createdAt: new Date()
    };
    setRules([...rules, rule]);
    toast.success(`Template "${template.name}" applied`);
  };

  const previewRules = () => {
    const activeRules = rules.filter(r => r.enabled);
    const highPriorityRules = activeRules.filter(r => r.priority >= 8);
    
    toast.info('Rule Engine Preview', {
      description: `${activeRules.length} active rules (${highPriorityRules.length} high priority) would be applied`
    });
  };

  const saveRules = () => {
    // In a real app, this would save to backend
    localStorage.setItem('scheduling-rules', JSON.stringify(rules));
    toast.success('Rules saved successfully');
  };

  const getRuleTypeColor = (type: Rule['type']) => {
    switch (type) {
      case 'machine': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'shift': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'capacity': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'buffer': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'priority': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getCategoryColor = (category: Rule['category']) => {
    switch (category) {
      case 'scheduling': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'resource': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'quality': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'safety': return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const sortedRules = [...rules].sort((a, b) => b.priority - a.priority);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Enhanced Rule Engine
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={previewMode}
                onCheckedChange={setPreviewMode}
              />
              <span className="text-xs">Preview Mode</span>
              <Button onClick={saveRules} size="sm" variant="outline">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{rules.filter(r => r.enabled).length} of {rules.length} rules active</span>
            <span>Avg Priority: {Math.round(rules.reduce((sum, rule) => sum + rule.priority, 0) / rules.length)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rules">Active Rules</TabsTrigger>
          <TabsTrigger value="create">Create Rule</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Scheduling Rules</h3>
            <Button onClick={previewRules} variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Test Rules
            </Button>
          </div>

          <div className="space-y-4">
            {sortedRules.map(rule => (
              <Card key={rule.id} className={`border-l-4 ${rule.enabled ? 'border-l-primary' : 'border-l-muted'}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => toggleRule(rule.id)}
                      />
                      <div>
                        <h3 className="font-semibold text-lg">{rule.name}</h3>
                        <p className="text-muted-foreground text-sm">{rule.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getRuleTypeColor(rule.type)}>
                        {rule.type}
                      </Badge>
                      <Badge variant="outline" className={getCategoryColor(rule.category)}>
                        {rule.category}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Priority Level</Label>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[rule.priority]}
                          onValueChange={([value]) => updateRulePriority(rule.id, value)}
                          max={10}
                          min={1}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium w-8">{rule.priority}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Action</Label>
                      <div className="text-sm text-muted-foreground">
                        {rule.action.type}: {rule.action.value} {rule.action.unit}
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-3 rounded-lg mb-4">
                    <div className="text-sm">
                      <strong>Condition:</strong> {rule.condition.field} {rule.condition.operator} {JSON.stringify(rule.condition.value)}
                      {rule.condition.unit && ` ${rule.condition.unit}`}
                    </div>
                    {rule.machineIds && rule.machineIds.length > 0 && (
                      <div className="text-sm mt-1">
                        <strong>Machines:</strong> {rule.machineIds.join(', ')}
                      </div>
                    )}
                    {rule.shiftTypes && rule.shiftTypes.length > 0 && (
                      <div className="text-sm mt-1">
                        <strong>Shifts:</strong> {rule.shiftTypes.join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      Created: {rule.createdAt.toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => duplicateRule(rule.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </Button>
                      <Button
                        onClick={() => deleteRule(rule.id)}
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Scheduling Rule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rule Name</Label>
                  <Input
                    placeholder="Enter descriptive rule name"
                    value={newRule.name || ''}
                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priority (1-10)</Label>
                  <Slider
                    value={[newRule.priority || 5]}
                    onValueChange={([value]) => setNewRule({ ...newRule, priority: value })}
                    max={10}
                    min={1}
                    step={1}
                  />
                  <div className="text-xs text-muted-foreground">Current: {newRule.priority}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rule Type</Label>
                  <Select 
                    value={newRule.type} 
                    onValueChange={(value: Rule['type']) => setNewRule({ ...newRule, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="machine">Machine Rules</SelectItem>
                      <SelectItem value="shift">Shift Scheduling</SelectItem>
                      <SelectItem value="capacity">Capacity Management</SelectItem>
                      <SelectItem value="buffer">Buffer Times</SelectItem>
                      <SelectItem value="priority">Priority Handling</SelectItem>
                      <SelectItem value="maintenance">Maintenance Windows</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select 
                    value={newRule.category} 
                    onValueChange={(value: Rule['category']) => setNewRule({ ...newRule, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduling">Scheduling</SelectItem>
                      <SelectItem value="resource">Resource Management</SelectItem>
                      <SelectItem value="quality">Quality Control</SelectItem>
                      <SelectItem value="safety">Safety & Compliance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe what this rule does and when it applies"
                  value={newRule.description || ''}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Condition Field</Label>
                  <Select
                    value={newRule.condition?.field || ''}
                    onValueChange={(value) => setNewRule({ 
                      ...newRule, 
                      condition: { ...newRule.condition!, field: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="machine_last_job_end">Machine Last Job End</SelectItem>
                      <SelectItem value="job_priority">Job Priority</SelectItem>
                      <SelectItem value="time_slot">Time Slot</SelectItem>
                      <SelectItem value="operator_skill">Operator Skill Level</SelectItem>
                      <SelectItem value="material_availability">Material Availability</SelectItem>
                      <SelectItem value="setup_time">Setup Time Required</SelectItem>
                      <SelectItem value="maintenance_schedule">Maintenance Schedule</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Operator</Label>
                  <Select
                    value={newRule.condition?.operator || 'equals'}
                    onValueChange={(value: any) => setNewRule({ 
                      ...newRule, 
                      condition: { ...newRule.condition!, operator: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="greater_than">Greater Than</SelectItem>
                      <SelectItem value="less_than">Less Than</SelectItem>
                      <SelectItem value="between">Between</SelectItem>
                      <SelectItem value="contains">Contains</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input
                    placeholder="Condition value"
                    value={newRule.condition?.value || ''}
                    onChange={(e) => setNewRule({ 
                      ...newRule, 
                      condition: { ...newRule.condition!, value: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Action Type</Label>
                  <Select
                    value={newRule.action?.type || 'delay'}
                    onValueChange={(value: any) => setNewRule({ 
                      ...newRule, 
                      action: { ...newRule.action!, type: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delay">Add Delay</SelectItem>
                      <SelectItem value="block">Block Scheduling</SelectItem>
                      <SelectItem value="alert">Send Alert</SelectItem>
                      <SelectItem value="reschedule">Reschedule Job</SelectItem>
                      <SelectItem value="reassign">Reassign Resource</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Action Value</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newRule.action?.value || ''}
                    onChange={(e) => setNewRule({ 
                      ...newRule, 
                      action: { ...newRule.action!, value: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select
                    value={newRule.action?.unit || 'minutes'}
                    onValueChange={(value: any) => setNewRule({ 
                      ...newRule, 
                      action: { ...newRule.action!, unit: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="percent">Percent</SelectItem>
                      <SelectItem value="count">Count</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={addRule} className="w-full" size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Create Rule
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Quick Start Templates</h3>
            <p className="text-muted-foreground text-sm">
              Pre-configured rules for common scheduling scenarios
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ruleTemplates.map(template => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <template.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex gap-2 mb-2">
                      <Badge className={getRuleTypeColor(template.rule.type!)}>
                        {template.rule.type}
                      </Badge>
                      <Badge variant="outline" className={getCategoryColor(template.rule.category!)}>
                        {template.rule.category}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Priority: {template.rule.priority}/10
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => applyTemplate(template)} 
                    className="w-full"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Apply Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
