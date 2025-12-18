import React, { useState, useContext, createContext } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/UI/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/UI/dialog';
import { ScrollArea } from '@/components/UI/scroll-area';
import { Badge } from '@/components/UI/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Separator } from '@/components/ui/separator';
import { 
  HelpCircle, 
  BookOpen, 
  Lightbulb, 
  Target, 
  Settings, 
  Zap, 
  BarChart3,
  Calendar,
  FileText,
  Database,
  Cpu,
  Activity,
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface HelpContent {
  title: string;
  description: string;
  icon: React.ReactNode;
  sections: {
    overview: string;
    keyFeatures: string[];
    quickStart: string[];
    tips: string[];
    troubleshooting: { issue: string; solution: string }[];
    shortcuts?: { key: string; action: string }[];
  };
}

const helpContent: Record<string, HelpContent> = {
  '/': {
    title: 'Production Scheduler',
    description: 'Main scheduling interface with Gantt charts, calendar views, and job management',
    icon: <Calendar className="w-5 h-5" />,
    sections: {
      overview: 'The Production Scheduler is your central hub for managing jobs, machines, and schedules. Switch between Gantt, Card, Calendar, and Conflict Detection views to visualize your production timeline.',
      keyFeatures: [
        'Interactive Gantt Chart with drag-and-drop scheduling',
        'Card View for detailed job information and progress tracking',
        'Calendar View for date-based schedule visualization',
        'Real-time Conflict Detection and resolution suggestions',
        'Smart Filters for quick job and machine filtering',
        'AI Assistant for intelligent scheduling recommendations'
      ],
      quickStart: [
        'Use the tabs at the top to switch between different views',
        'Apply filters using the Smart Filters panel to find specific jobs',
        'Drag and drop jobs in Gantt view to reschedule them',
        'Click the AI Assistant button for intelligent suggestions',
        'Use Ctrl+K for global search across all data'
      ],
      tips: [
        'Hold Ctrl while dragging to create job dependencies',
        'Jobs with conflicts show colored overlays - check Conflict Detection tab',
        'Use the floating action button for quick access to common actions',
        'Machine utilization badges show capacity at a glance',
        'Filter combinations help narrow down large datasets effectively'
      ],
      troubleshooting: [
        { issue: 'Jobs not showing in Gantt view', solution: 'Check your current filters - clear them to see all jobs' },
        { issue: 'Cannot drag jobs', solution: 'Ensure you\'re not in a filtered view that hides the target machine' },
        { issue: 'Conflicts not resolving', solution: 'Use the Conflict Detection tab for detailed resolution steps' }
      ],
      shortcuts: [
        { key: 'Ctrl+K', action: 'Open global search' },
        { key: 'Tab', action: 'Switch between view tabs' },
        { key: 'Ctrl+Drag', action: 'Create job dependencies' }
      ]
    }
  },
  '/performance': {
    title: 'Performance Analytics',
    description: 'Advanced performance monitoring and optimization tools',
    icon: <Activity className="w-5 h-5" />,
    sections: {
      overview: 'Performance Analytics provides deep insights into your production efficiency, bottlenecks, and optimization opportunities with AI-powered recommendations.',
      keyFeatures: [
        'Real-time performance metrics and KPIs',
        'Bottleneck identification and analysis',
        'Automated optimization suggestions',
        'Historical performance trends',
        'Machine utilization analytics',
        'Scenario planning and what-if analysis'
      ],
      quickStart: [
        'Review the main dashboard for key performance indicators',
        'Use the optimization engine for automated improvements',
        'Check bottleneck analysis for production constraints',
        'Run scenario planning for future capacity needs',
        'Monitor real-time metrics during production'
      ],
      tips: [
        'Set performance alerts for critical thresholds',
        'Use historical data to identify seasonal patterns',
        'Compare scenarios before implementing changes',
        'Monitor machine utilization to balance workloads',
        'Regular performance reviews help maintain efficiency'
      ],
      troubleshooting: [
        { issue: 'Metrics not updating', solution: 'Check data sync status and refresh the dashboard' },
        { issue: 'Optimization suggestions seem incorrect', solution: 'Verify your constraints and priorities in settings' },
        { issue: 'Performance trends missing', solution: 'Ensure sufficient historical data is available' }
      ]
    }
  },
  '/analytics': {
    title: 'Business Analytics',
    description: 'Comprehensive business intelligence and reporting dashboard',
    icon: <BarChart3 className="w-5 h-5" />,
    sections: {
      overview: 'Business Analytics transforms your production data into actionable insights with customizable dashboards, reports, and trend analysis.',
      keyFeatures: [
        'Interactive charts and visualizations',
        'Custom dashboard creation',
        'Automated report generation',
        'Trend analysis and forecasting',
        'Export capabilities for presentations',
        'Real-time data updates'
      ],
      quickStart: [
        'Explore pre-built dashboards for common metrics',
        'Create custom charts using the chart builder',
        'Set up automated reports for regular delivery',
        'Use filters to focus on specific time periods or machines',
        'Export charts and reports for sharing'
      ],
      tips: [
        'Combine multiple metrics for comprehensive analysis',
        'Use date ranges to compare different periods',
        'Save frequently used chart configurations',
        'Set up alerts for metric thresholds',
        'Regular dashboard reviews help spot trends early'
      ],
      troubleshooting: [
        { issue: 'Charts not loading', solution: 'Check your internet connection and refresh the page' },
        { issue: 'Data appears outdated', solution: 'Verify data sync settings and force a refresh' },
        { issue: 'Export not working', solution: 'Ensure pop-ups are enabled for this site' }
      ]
    }
  },
  '/rules': {
    title: 'Business Rules Engine',
    description: 'Configure automated rules and constraints for intelligent scheduling',
    icon: <Settings className="w-5 h-5" />,
    sections: {
      overview: 'The Business Rules Engine allows you to define custom rules, constraints, and automation logic that guides the scheduling system\'s decision-making process.',
      keyFeatures: [
        'Visual rule builder with drag-and-drop interface',
        'Pre-built rule templates for common scenarios',
        'Condition-based automation triggers',
        'Rule priority and conflict resolution',
        'Testing and validation tools',
        'Rule performance monitoring'
      ],
      quickStart: [
        'Start with rule templates for common scenarios',
        'Use the visual builder to create custom rules',
        'Test rules before activating them',
        'Set appropriate rule priorities',
        'Monitor rule performance and effectiveness'
      ],
      tips: [
        'Start simple and add complexity gradually',
        'Test rules thoroughly before production use',
        'Use rule priorities to handle conflicts',
        'Regular rule audits ensure continued effectiveness',
        'Document rule purposes for team understanding'
      ],
      troubleshooting: [
        { issue: 'Rules not triggering', solution: 'Check rule conditions and ensure they match your data' },
        { issue: 'Conflicting rules', solution: 'Review rule priorities and adjust accordingly' },
        { issue: 'Rule performance issues', solution: 'Optimize rule conditions and consider rule consolidation' }
      ]
    }
  },
  '/erp-integration': {
    title: 'ERP Integration',
    description: 'Connect and synchronize with external ERP and business systems',
    icon: <Database className="w-5 h-5" />,
    sections: {
      overview: 'ERP Integration enables seamless connectivity with your existing business systems, ensuring data consistency and automated workflows across your organization.',
      keyFeatures: [
        'Multi-system connectivity options',
        'Real-time data synchronization',
        'Automated data mapping and transformation',
        'Error handling and retry mechanisms',
        'Integration monitoring and logging',
        'Custom API endpoints and webhooks'
      ],
      quickStart: [
        'Configure connection settings for your ERP system',
        'Set up data mapping between systems',
        'Test the integration with sample data',
        'Enable real-time synchronization',
        'Monitor integration health regularly'
      ],
      tips: [
        'Start with read-only integration to test connectivity',
        'Use staged rollouts for critical integrations',
        'Monitor data quality after integration setup',
        'Keep backup procedures for integration failures',
        'Regular integration health checks prevent issues'
      ],
      troubleshooting: [
        { issue: 'Connection failures', solution: 'Verify network connectivity and authentication credentials' },
        { issue: 'Data sync errors', solution: 'Check data mapping configuration and field compatibility' },
        { issue: 'Performance slowdowns', solution: 'Optimize sync frequency and batch sizes' }
      ]
    }
  },
  '/simulation': {
    title: 'Simulation Mode',
    description: 'Test scenarios and changes in a risk-free simulation environment',
    icon: <Cpu className="w-5 h-5" />,
    sections: {
      overview: 'Simulation Mode provides a safe environment to test scheduling changes, evaluate different scenarios, and validate optimization strategies before implementing them in production.',
      keyFeatures: [
        'Full production environment simulation',
        'Scenario comparison tools',
        'What-if analysis capabilities',
        'Historical data replay',
        'Performance impact assessment',
        'Risk-free experimentation'
      ],
      quickStart: [
        'Create a new simulation from current production data',
        'Make changes to test different scenarios',
        'Compare simulation results with current state',
        'Analyze performance impacts',
        'Apply successful changes to production'
      ],
      tips: [
        'Use realistic data for accurate simulations',
        'Test edge cases and unusual scenarios',
        'Compare multiple alternatives before deciding',
        'Document simulation results for future reference',
        'Regular simulation exercises improve planning'
      ],
      troubleshooting: [
        { issue: 'Simulation not starting', solution: 'Ensure sufficient historical data is available' },
        { issue: 'Unrealistic results', solution: 'Verify simulation parameters and constraints' },
        { issue: 'Performance issues', solution: 'Reduce simulation complexity or time range' }
      ]
    }
  },
  '/configuration': {
    title: 'System Configuration',
    description: 'Manage system settings, preferences, and operational parameters',
    icon: <Settings className="w-5 h-5" />,
    sections: {
      overview: 'System Configuration centralizes all system settings, user preferences, and operational parameters to customize the platform according to your specific needs.',
      keyFeatures: [
        'User preference management',
        'System parameter configuration',
        'Security and access controls',
        'Notification settings',
        'Data retention policies',
        'Performance tuning options'
      ],
      quickStart: [
        'Review default settings and adjust as needed',
        'Configure user roles and permissions',
        'Set up notification preferences',
        'Adjust performance parameters',
        'Test configuration changes in simulation'
      ],
      tips: [
        'Document configuration changes for team awareness',
        'Test configuration changes before applying',
        'Regular configuration backups prevent data loss',
        'Use configuration templates for consistency',
        'Monitor system performance after changes'
      ],
      troubleshooting: [
        { issue: 'Settings not saving', solution: 'Check user permissions and try again' },
        { issue: 'Performance degradation', solution: 'Review recent configuration changes and revert if necessary' },
        { issue: 'Access denied errors', solution: 'Verify user roles and permission settings' }
      ]
    }
  },
  '/sync-status': {
    title: 'Synchronization Status',
    description: 'Monitor data synchronization health and resolve sync issues',
    icon: <Zap className="w-5 h-5" />,
    sections: {
      overview: 'Synchronization Status provides real-time monitoring of data sync processes, error tracking, and tools to maintain data consistency across all connected systems.',
      keyFeatures: [
        'Real-time sync status monitoring',
        'Error detection and alerting',
        'Manual sync triggers',
        'Sync history and logs',
        'Data consistency validation',
        'Automated retry mechanisms'
      ],
      quickStart: [
        'Check overall sync health on the main dashboard',
        'Review any error messages or failed syncs',
        'Use manual sync triggers for immediate updates',
        'Monitor sync frequency and performance',
        'Set up alerts for critical sync failures'
      ],
      tips: [
        'Regular sync monitoring prevents data issues',
        'Address sync errors promptly to maintain consistency',
        'Use manual sync during critical operations',
        'Monitor sync performance during peak times',
        'Keep sync logs for troubleshooting purposes'
      ],
      troubleshooting: [
        { issue: 'Sync failures', solution: 'Check network connectivity and system availability' },
        { issue: 'Data inconsistencies', solution: 'Run data validation and force full sync if needed' },
        { issue: 'Slow sync performance', solution: 'Check system resources and optimize sync parameters' }
      ]
    }
  },
  '/reports': {
    title: 'Reports & Documentation',
    description: 'Generate, schedule, and manage comprehensive business reports',
    icon: <FileText className="w-5 h-5" />,
    sections: {
      overview: 'Reports & Documentation enables creation of detailed business reports, automated report scheduling, and comprehensive documentation of your production processes.',
      keyFeatures: [
        'Pre-built report templates',
        'Custom report builder',
        'Automated report scheduling',
        'Multiple export formats',
        'Report sharing and distribution',
        'Historical report archive'
      ],
      quickStart: [
        'Browse available report templates',
        'Generate your first report using a template',
        'Customize reports to match your needs',
        'Set up automated report delivery',
        'Share reports with stakeholders'
      ],
      tips: [
        'Use templates as starting points for custom reports',
        'Schedule regular reports for consistent monitoring',
        'Export reports in appropriate formats for recipients',
        'Archive important reports for historical reference',
        'Regular report reviews help identify trends'
      ],
      troubleshooting: [
        { issue: 'Report generation fails', solution: 'Check data availability and report parameters' },
        { issue: 'Missing data in reports', solution: 'Verify data sync status and date ranges' },
        { issue: 'Export errors', solution: 'Try different export formats or reduce report complexity' }
      ]
    }
  }
};

interface HelpContextType {
  isOpen: boolean;
  openHelp: () => void;
  closeHelp: () => void;
}

const HelpContext = createContext<HelpContextType | undefined>(undefined);

export const HelpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openHelp = () => setIsOpen(true);
  const closeHelp = () => setIsOpen(false);

  return (
    <HelpContext.Provider value={{ isOpen, openHelp, closeHelp }}>
      {children}
      <HelpModal />
    </HelpContext.Provider>
  );
};

export const useHelp = () => {
  const context = useContext(HelpContext);
  if (!context) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
};

export const HelpButton: React.FC<{ className?: string }> = ({ className }) => {
  const { openHelp } = useHelp();

  return (
    <Button
      onClick={openHelp}
      variant="ghost"
      size="sm"
      className={`gap-2 ${className}`}
    >
      <HelpCircle className="w-4 h-4" />
      Help
    </Button>
  );
};

const HelpModal: React.FC = () => {
  const { isOpen, closeHelp } = useHelp();
  const location = useLocation();
  const currentPath = location.pathname;
  const content = helpContent[currentPath] || helpContent['/'];

  return (
    <Dialog open={isOpen} onOpenChange={closeHelp}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {content.icon}
            {content.title} - Help & Guide
          </DialogTitle>
          <p className="text-muted-foreground">{content.description}</p>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
            <TabsTrigger value="tips">Tips & Tricks</TabsTrigger>
            <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[500px] mt-4">
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Module Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{content.sections.overview}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Key Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {content.sections.keyFeatures.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quickstart" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Quick Start Guide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {content.sections.quickStart.map((step, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Badge variant="outline" className="text-xs">
                          {index + 1}
                        </Badge>
                        <span className="text-sm">{step}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {content.sections.shortcuts && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Keyboard Shortcuts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {content.sections.shortcuts.map((shortcut, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm">{shortcut.action}</span>
                          <Badge variant="secondary" className="font-mono text-xs">
                            {shortcut.key}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="tips" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Tips & Best Practices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {content.sections.tips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{tip}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="troubleshooting" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Common Issues & Solutions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {content.sections.troubleshooting.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{item.issue}</p>
                            <p className="text-sm text-muted-foreground">{item.solution}</p>
                          </div>
                        </div>
                        {index < content.sections.troubleshooting.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};