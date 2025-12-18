
import { cn } from "@/lib/utils";

interface ModernLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  className?: string;
}

export const ModernLoading = ({ 
  size = 'md', 
  variant = 'spinner', 
  className 
}: ModernLoadingProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  if (variant === 'spinner') {
    return (
      <div className={cn("relative", sizeClasses[size], className)}>
        <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin"></div>
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "rounded-full bg-primary animate-pulse",
              size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3'
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-md animate-pulse",
      sizeClasses[size],
      className
    )} />
  );
};

export const LoadingCard = ({ className }: { className?: string }) => (
  <div className={cn("glass-panel rounded-xl p-6 space-y-4", className)}>
    <div className="space-y-2">
      <div className="skeleton-modern h-4 w-3/4"></div>
      <div className="skeleton-modern h-3 w-1/2"></div>
    </div>
    <div className="skeleton-modern h-20 w-full"></div>
    <div className="flex gap-2">
      <div className="skeleton-modern h-8 w-16"></div>
      <div className="skeleton-modern h-8 w-20"></div>
    </div>
  </div>
);

export const LoadingPage = () => (
  <div className="min-h-screen flex items-center justify-center gradient-surface">
    <div className="text-center space-y-6">
      <ModernLoading size="lg" />
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Loading SysPlanoViz</h2>
        <p className="text-muted-foreground">Preparing your scheduling environment...</p>
      </div>
    </div>
  </div>
);
