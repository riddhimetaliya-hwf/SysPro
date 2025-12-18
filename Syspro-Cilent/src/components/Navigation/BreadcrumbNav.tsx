
import React from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Home, Calendar, Settings, BarChart3 } from "lucide-react";
import { useLocation } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export const BreadcrumbNav = () => {
  const location = useLocation();
  
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const path = location.pathname;
    
    const routes: Record<string, BreadcrumbItem[]> = {
      '/': [
        { label: 'Home', href: '/', icon: <Home size={16} /> }
      ],
      '/rules': [
        { label: 'Home', href: '/', icon: <Home size={16} /> },
        { label: 'Rules Engine', icon: <Settings size={16} /> }
      ],
      '/configuration': [
        { label: 'Home', href: '/', icon: <Home size={16} /> },
        { label: 'Configuration', icon: <Settings size={16} /> }
      ],
      '/sync-status': [
        { label: 'Home', href: '/', icon: <Home size={16} /> },
        { label: 'Sync Status', icon: <Calendar size={16} /> }
      ],
      '/reports': [
        { label: 'Home', href: '/', icon: <Home size={16} /> },
        { label: 'Reports', icon: <BarChart3 size={16} /> }
      ]
    };

    return routes[path] || [{ label: 'Home', href: '/', icon: <Home size={16} /> }];
  };

  const breadcrumbs = getBreadcrumbs();

  if (breadcrumbs.length <= 1) return null;

  return (
    <div className="px-6 py-3 bg-background/50 backdrop-blur-sm border-b border-border/50">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {item.href && index < breadcrumbs.length - 1 ? (
                  <BreadcrumbLink 
                    href={item.href}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    {item.icon}
                    {item.label}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="flex items-center gap-2 font-medium">
                    {item.icon}
                    {item.label}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
