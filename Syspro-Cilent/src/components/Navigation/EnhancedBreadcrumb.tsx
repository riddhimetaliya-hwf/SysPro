import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Home, Filter, X, Calendar, LayoutGrid, Users, Zap, BarChart3 } from 'lucide-react';
import { FilterOptions } from '@/types/jobs';

interface EnhancedBreadcrumbProps {
  currentFilters?: FilterOptions;
  onClearFilter?: (filterKey: keyof FilterOptions) => void;
  onClearAllFilters?: () => void;
  activeView?: string;
  className?: string;
}

export const EnhancedBreadcrumb = ({ 
  currentFilters, 
  onClearFilter, 
  onClearAllFilters,
  activeView,
  className 
}: EnhancedBreadcrumbProps) => {
  const location = useLocation();
  
  // Generate breadcrumb path based on current route
  const getBreadcrumbPath = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    const breadcrumbs = [
      { label: 'Dashboard', href: '/', icon: <Home className="w-3 h-3" /> }
    ];
    
    segments.forEach((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/');
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
      
      let icon;
      switch (segment.toLowerCase()) {
        case 'analytics':
          icon = <BarChart3 className="w-3 h-3" />;
          break;
        case 'rules':
          icon = <Filter className="w-3 h-3" />;
          break;
        case 'configuration':
          icon = <Users className="w-3 h-3" />;
          break;
        default:
          icon = null;
      }
      
      breadcrumbs.push({ label, href, icon });
    });
    
    return breadcrumbs;
  };

  const getViewIcon = (view?: string) => {
    switch (view) {
      case 'gantt': return <Calendar className="w-3 h-3" />;
      case 'card': return <LayoutGrid className="w-3 h-3" />;
      case 'calendar': return <Calendar className="w-3 h-3" />;
      case 'shift': return <Users className="w-3 h-3" />;
      case 'conflicts': return <Zap className="w-3 h-3" />;
      default: return null;
    }
  };

  // Count active filters
  const getActiveFilterCount = () => {
    if (!currentFilters) return 0;
    return Object.entries(currentFilters).filter(([key, value]) => {
      if (key === 'search') return value && value.trim() !== '';
      return value !== null && value !== '';
    }).length;
  };

  const activeFilterCount = getActiveFilterCount();
  const breadcrumbs = getBreadcrumbPath();

  return (
    <div className={`flex flex-col gap-3 p-4 bg-muted/30 border-b ${className || ''}`}>
      {/* Main Breadcrumb */}
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((breadcrumb, index) => (
              <React.Fragment key={breadcrumb.href}>
                <BreadcrumbItem>
                  {index === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage className="flex items-center gap-2 font-medium">
                      {breadcrumb.icon}
                      {breadcrumb.label}
                      {activeView && (
                        <>
                          <Separator orientation="vertical" className="h-4" />
                          <div className="flex items-center gap-1 text-muted-foreground">
                            {getViewIcon(activeView)}
                            <span className="capitalize">{activeView} View</span>
                          </div>
                        </>
                      )}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={breadcrumb.href} className="flex items-center gap-2 hover:text-foreground transition-colors">
                        {breadcrumb.icon}
                        {breadcrumb.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Active Filters Summary */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Filter className="w-3 h-3" />
              {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
            </Badge>
            {onClearAllFilters && (
              <Button variant="ghost" size="sm" onClick={onClearAllFilters} className="h-6 px-2 text-xs">
                Clear All
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Active Filters Detail */}
      {currentFilters && activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Active Filters:
          </span>
          
          {currentFilters.machine && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              Machine: {currentFilters.machine}
              {onClearFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => onClearFilter('machine')}
                >
                  <X className="w-2 h-2" />
                </Button>
              )}
            </Badge>
          )}

          {currentFilters.status && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              Status: {currentFilters.status}
              {onClearFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => onClearFilter('status')}
                >
                  <X className="w-2 h-2" />
                </Button>
              )}
            </Badge>
          )}

          {currentFilters.material && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              Material: {currentFilters.material}
              {onClearFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => onClearFilter('material')}
                >
                  <X className="w-2 h-2" />
                </Button>
              )}
            </Badge>
          )}

          {currentFilters.search && currentFilters.search.trim() !== '' && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              Search: "{currentFilters.search}"
              {onClearFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => onClearFilter('search')}
                >
                  <X className="w-2 h-2" />
                </Button>
              )}
            </Badge>
          )}

          {currentFilters.crewSkill && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              Skill: {currentFilters.crewSkill}
              {onClearFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => onClearFilter('crewSkill')}
                >
                  <X className="w-2 h-2" />
                </Button>
              )}
            </Badge>
          )}

          {currentFilters.product && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              Product: {currentFilters.product}
              {onClearFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => onClearFilter('product')}
                >
                  <X className="w-2 h-2" />
                </Button>
              )}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};