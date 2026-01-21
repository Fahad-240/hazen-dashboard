import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Handshake,
  DollarSign,
  CircleUser,
  Briefcase,
  Flag,
  Bell,
  ChartBar,
  Trophy,
  Wallet,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "../ui/utils";
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobile?: boolean;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, permission: null },
  { id: "users", label: "Users", icon: Users, permission: "view_users" as const },
  { id: "deals", label: "Deals", icon: Handshake, permission: "view_deals" as const },
  { id: "financials", label: "Financials", icon: DollarSign, permission: "view_analytics" as const },
  { id: "agents", label: "Agents", icon: CircleUser, permission: "view_users" as const },
  { id: "gigs", label: "Gigs", icon: Briefcase, permission: "view_gigs" as const },
  { id: "moderation", label: "Moderation", icon: Flag, permission: "moderate_content" as const },
  { id: "notifications", label: "Notifications", icon: Bell, permission: "manage_support" as const },
  { id: "analytics", label: "Analytics", icon: ChartBar, permission: "view_analytics" as const },
  { id: "rewards", label: "Rewards", icon: Trophy, permission: "manage_rewards" as const },
  { id: "withdrawals", label: "Withdrawals", icon: Wallet, permission: "manage_rewards" as const },
  { id: "settings", label: "Settings", icon: Settings, permission: "system_settings" as const },
  { id: "security", label: "Security", icon: Shield, permission: "system_settings" as const },
];

export function Sidebar({ currentView, onNavigate, collapsed, onToggleCollapse, mobile = false }: SidebarProps) {
  const { permissions, user, isSuperAdmin } = useAuth();

  // Filter menu items based on permissions
  const visibleMenuItems = menuItems.filter((item) => {
    if (!item.permission) return true; // Dashboard is always visible
    
    // Super admin ko sab items dikhne chahiye
    if (isSuperAdmin) return true;
    
    // Check if permission exists and is true
    if (!permissions || !item.permission) return false;
    // Use type-safe access
    const permissionKey = item.permission as keyof typeof permissions;
    return permissions[permissionKey] === true;
  });

  return (
    <aside
      className={cn(
        "flex flex-col bg-slate-900 text-white border-r border-slate-800 transition-all duration-300",
        mobile ? "w-full" : "hidden lg:flex",
        !mobile && (collapsed ? "w-16" : "w-64")
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-slate-900 font-bold text-sm">SI</span>
            </div>
            <span className="font-semibold">Source Impact</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mx-auto">
            <span className="text-slate-900 font-bold text-sm">SI</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        <div className="space-y-1 px-2">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white",
                  collapsed && "justify-center"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-slate-800">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}