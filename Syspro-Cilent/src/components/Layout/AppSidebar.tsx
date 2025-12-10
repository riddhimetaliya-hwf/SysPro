import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Calendar,
  FileText,
  RefreshCw,
  Bell,
  User,
  Zap,
  BarChart3,
  Package,
  FlaskConical,
  Sliders,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/UI/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/UI/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/UI/dropdown-menu";
import { Badge } from "@/components/UI/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/UI/tooltip";

export const AppSidebar = () => {
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const handleToggle = () => setCollapsed((prev) => !prev);

  return (
    <div className="flex">
      <Sidebar>
        <SidebarHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white font-bold">
                VS
              </div>
              <h2 className="text-lg font-bold text-gradient">
                Visual Scheduler
              </h2>
            </div>
            <SidebarTrigger onClick={handleToggle} className="focus-outline" />
            {/* <SidebarTrigger className="focus-outline" /> */}
          </div>
        </SidebarHeader>

        <SidebarContent>
          <div className="py-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/"}
                  tooltip="Scheduler"
                  className="focus-outline transition-colors"
                >
                  <Link to="/" aria-label="Scheduler">
                    <Calendar size={18} />
                    <span>Scheduler</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/analytics"}
                  tooltip="Analytics"
                  className="focus-outline transition-colors"
                >
                  <Link to="/analytics" aria-label="Analytics">
                    <BarChart3 size={18} />
                    <span>Analytics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/rules"}
                  tooltip="Rules Engine"
                  className="focus-outline transition-colors"
                >
                  <Link to="/rules" aria-label="Rules Engine">
                    <Sliders size={18} />
                    <span>Rules Engine</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/erp-integration"}
                  tooltip="ERP Integration"
                  className="focus-outline transition-colors"
                >
                  <Link to="/erp-integration" aria-label="ERP Integration">
                    <Package size={18} />
                    <span>ERP Integration</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/simulation"}
                  tooltip="Simulation Mode"
                  className="focus-outline transition-colors"
                >
                  <Link to="/simulation" aria-label="Simulation Mode">
                    <FlaskConical size={18} />
                    <span>Simulation Mode</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/configuration"}
                  tooltip="Configuration"
                  className="focus-outline transition-colors"
                >
                  <Link to="/configuration" aria-label="Configuration">
                    <Settings size={18} />
                    <span>Configuration</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/reports"}
                  tooltip="Reports"
                  className="focus-outline transition-colors"
                >
                  <Link to="/reports" aria-label="Reports">
                    <FileText size={18} />
                    <span>Reports</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/sync-status"}
                  tooltip="Sync Status"
                  className="focus-outline transition-colors"
                >
                  <Link to="/sync-status" aria-label="Sync Status">
                    <RefreshCw size={18} />
                    <span>Sync Status</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            {/* Notification section */}
            <div className="px-3 mt-6">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-accent focus:bg-accent focus-outline transition-colors"
                      aria-label="3 new notifications"
                    >
                      <Bell size={18} />
                      <span>Notifications</span>
                      <Badge variant="secondary" className="ml-auto">
                        3
                      </Badge>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>You have 3 unread notifications</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t">
          <div className="flex flex-col gap-4">
            <div className="text-xs text-muted-foreground p-2 bg-secondary/80 rounded-md flex items-center gap-2">
              <div className="size-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Last sync: 5 minutes ago</span>
            </div>

            {/* License Status Indicator */}
            <div className="text-xs p-2 bg-primary/10 rounded-md flex items-center gap-2">
              <Zap className="w-3 h-3 text-primary" />
              <span className="text-primary font-medium">
                Performance Model Active
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 p-2 rounded-md hover:bg-accent focus-outline transition-colors w-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg" alt="User" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">John Doe</span>
                    <span className="text-xs text-muted-foreground">
                      Administrator
                    </span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span className="text-destructive">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarFooter>
      </Sidebar>
      {collapsed && (
        <div className="fixed top-[60px] left-2 z-50">
          <SidebarTrigger
            onClick={handleToggle}
            title="Visual Scheduler"
            className="focus-outline p-2 bg-gray-800 text-white rounded shadow hover:bg-gray-700"
          />
        </div>
      )}
    </div>
  );
};
