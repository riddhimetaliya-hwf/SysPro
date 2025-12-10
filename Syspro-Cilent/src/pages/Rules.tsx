import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/UI/sidebar';
import { Header } from '@/components/Layout/Header';
import { AppSidebar } from '@/components/Layout/AppSidebar';
import { ComprehensiveRuleEngine, SchedulingRule as ComponentSchedulingRule } from '@/components/Performance/ComprehensiveRuleEngine';
import { BreadcrumbNav } from '@/components/Navigation/BreadcrumbNav';
import { Card, CardContent } from '@/components/UI/card';
import { Settings, Sliders, Zap, AlertTriangle, Clock } from 'lucide-react';
import { apiService } from '@/services/api';
import { SchedulingRule as ApiSchedulingRule } from '@/types/jobs';

// Type guard to check if a rule is in the component's expected format
const isComponentSchedulingRule = (rule: any): rule is ComponentSchedulingRule => {
  return (
    typeof rule === 'object' &&
    rule !== null &&
    'ruleName' in rule &&
    'category' in rule &&
    'condition' in rule &&
    typeof rule.condition === 'object' &&
    'field' in rule.condition &&
    'operator' in rule.condition
  );
};

// Type for the action mapping
const mapApiActionToComponentAction = (action: string): ComponentSchedulingRule['action'] => {
  // Define a mapping of API action strings to component action types
  const actionMap: Record<string, ComponentSchedulingRule['action']['type']> = {
    'delay': 'delay',
    'reschedule': 'reschedule',
    'reassign': 'reassign',
    'alert': 'alert',
    'block': 'block',
    'notify': 'alert',  // Map 'notify' to 'alert' if they serve the same purpose
    'warning': 'alert'   // Map 'warning' to 'alert' if they serve the same purpose
  };

  // Normalize the action string (trim and lowercase)
  const normalizedAction = (action || '').toString().trim().toLowerCase();
  
  // Get the mapped type or default to 'alert' if no match found
  const actionType = actionMap[normalizedAction] || 'alert';
  
  // Return the properly formatted action object
  return {
    type: actionType,
    parameters: {
      message: action,
      // Add any additional parameters based on action type
      ...(actionType === 'delay' && { duration: '1h' }), // Default delay duration
      ...(actionType === 'reschedule' && { when: 'next_available' }), // Default reschedule time
    }
  };
};

// Transform API rule to component rule format
const transformApiRuleToComponentRule = (apiRule: ApiSchedulingRule): ComponentSchedulingRule => {
  // Parse the action from the API rule, defaulting to an empty string if not present
  const apiAction = apiRule.action || '';
  
  // Since apiRule.action is defined as a string in the interface,
  // we'll always use the mapApiActionToComponentAction function
  const action = mapApiActionToComponentAction(apiAction);

  return {
    id: apiRule.id || `rule-${Math.random().toString(36).substr(2, 9)}`,
    ruleName: apiRule.ruleName || 'Unnamed Rule',
    category: 'custom',
    condition: {
      field: 'job',
      operator: 'equals',
      value: apiRule.condition  || '',
    },
    action,
    priority: 0, // Default priority since it's not in the API response
    enabled: apiRule.isActive !== undefined ? apiRule.isActive : true,
    lastModified: new Date(),
    appliedCount: 0, // Default value since it's not in the API response
    jobDescription: apiRule.jobDescription || '',
    createdAt: new Date(),
  };
};

const Rules = () => {
  const [rules, setRules] = useState<ComponentSchedulingRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getRuleEngineDashboard();
      console.log('API Response:', response);
      
      if (response.rules && Array.isArray(response.rules)) {
        // Transform each rule to the component's expected format
        const transformedRules = response.rules.map(rule => 
          isComponentSchedulingRule(rule) 
            ? rule 
            : transformApiRuleToComponentRule(rule as unknown as ApiSchedulingRule)
        );
        
        console.log('Transformed rules:', transformedRules);
        setRules(transformedRules);
      } else {
        console.warn('No rules array found in the response or invalid format');
        setRules([]);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching rules:", err);
      setError("Failed to load rules");
      setRules([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  // Calculate stats
  const activeRules = rules.filter(rule => rule.enabled).length;
  const totalRules = rules.length;
  
  // Calculate category-wise counts
  const categoryCounts = rules.reduce((acc, rule) => {
    if (rule.category) {
      acc[rule.category] = (acc[rule.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Calculate high priority rules count
  const highPriority = rules.filter(rule => rule.priority && rule.priority >= 8 && rule.enabled).length;

  const automations = rules.filter(rule => 
    rule.action && rule.action.type !== 'alert' && rule.enabled
  ).length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <Header />
          <main className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
            <BreadcrumbNav />
            
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                    <Sliders className="w-8 h-8 text-primary" />
                  </div>
                  Rules Engine
                </h1>
                <p className="text-muted-foreground mt-2">
                  Configure intelligent scheduling rules to optimize production workflows, 
                  manage machine cooldowns, shift preferences, and automated decision-making.
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900">
                      <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Rules</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold">
                          {isLoading ? '...' : totalRules || 0}
                        </p>
                        <span className="text-sm text-muted-foreground">
                          / {isLoading ? '...' : activeRules || 0} active
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900">
                      <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Rules</p>
                      <p className="text-2xl font-bold">
                        {isLoading ? '...' : activeRules || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Category Cards */}
              {/* {Object.entries(categoryCounts).map(([category, count]) => (
                <Card key={category}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg dark:bg-purple-900">
                        <AlertTriangle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{category}</p>
                        <p className="text-2xl font-bold">
                          {isLoading ? '...' : count}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))} */}
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg dark:bg-amber-900">
                      <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Automations</p>
                      <p className="text-2xl font-bold">{isLoading ? '...' : automations}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg dark:bg-red-900">
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                      <p className="text-2xl font-bold">{isLoading ? '...' : highPriority}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Comprehensive Rule Engine */}
            <div className="mt-6">
              <ComprehensiveRuleEngine 
                initialRules={rules}
                onRulesUpdate={setRules}
                isLoading={isLoading}
              />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Rules;