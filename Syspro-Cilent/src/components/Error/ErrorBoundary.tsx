import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  RefreshCw, 
  Bug, 
  ExternalLink,
  Copy,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      showDetails: false,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Send error to monitoring service (if configured)
    // Example: logErrorToService(error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  private copyErrorDetails = () => {
    const errorText = `
Error: ${this.state.error?.message}
Stack: ${this.state.error?.stack}
Component Stack: ${this.state.errorInfo?.componentStack}
    `.trim();

    navigator.clipboard.writeText(errorText).then(() => {
      toast.success('Error details copied to clipboard');
    });
  };

  private toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-xl">Something went wrong</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    An unexpected error occurred while rendering this page
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <Alert>
                <Bug className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {this.state.error?.message || 'Unknown error occurred'}
                </AlertDescription>
              </Alert>

              <div className="flex flex-wrap gap-3">
                <Button onClick={this.handleReload} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Reload Page
                </Button>
                
                <Button variant="outline" onClick={this.handleReset} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>

                <Button 
                  variant="outline" 
                  onClick={this.copyErrorDetails}
                  className="gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Error
                </Button>
              </div>

              {/* Error Details */}
              <div className="border-t pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={this.toggleDetails}
                  className="gap-2 mb-3"
                >
                  {this.state.showDetails ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  {this.state.showDetails ? 'Hide' : 'Show'} Technical Details
                </Button>

                {this.state.showDetails && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Error Stack</h4>
                      <div className="bg-muted p-3 rounded-md text-xs font-mono overflow-auto max-h-40">
                        <pre>{this.state.error?.stack}</pre>
                      </div>
                    </div>

                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Component Stack</h4>
                        <div className="bg-muted p-3 rounded-md text-xs font-mono overflow-auto max-h-40">
                          <pre>{this.state.errorInfo.componentStack}</pre>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">
                        Timestamp: {new Date().toISOString()}
                      </Badge>
                      <Badge variant="outline">
                        URL: {window.location.href}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              {/* Help Links */}
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-3">
                  If this problem persists, you can:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href="https://docs.lovable.dev/tips-tricks/troubleshooting" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Troubleshooting Guide
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href="https://discord.com/channels/1119885301872070706/1280461670979993613" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Get Help on Discord
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Specific error boundary components for different sections
export const GanttErrorBoundary = ({ children }: { children: ReactNode }) => (
  <ErrorBoundary
    fallback={
      <div className="flex items-center justify-center h-64 border border-dashed border-border rounded-lg">
        <div className="text-center space-y-2">
          <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">
            Unable to load Gantt chart
          </p>
          <Button size="sm" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </div>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);

export const ChartErrorBoundary = ({ children }: { children: ReactNode }) => (
  <ErrorBoundary
    fallback={
      <div className="flex items-center justify-center h-40 border border-dashed border-border rounded-lg">
        <div className="text-center space-y-2">
          <AlertTriangle className="w-6 h-6 text-muted-foreground mx-auto" />
          <p className="text-xs text-muted-foreground">Chart unavailable</p>
        </div>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);