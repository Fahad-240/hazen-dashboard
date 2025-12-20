import {
  LayoutDashboard,
  Users,
  Handshake,
  DollarSign,
  Settings,
  BarChart3,
} from "lucide-react";
import { cn } from "../ui/utils";

interface MobileNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const mobileMenuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users },
  { id: "deals", label: "Deals", icon: Handshake },
  { id: "financials", label: "Finance", icon: DollarSign },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

export function MobileNav({ currentView, onNavigate }: MobileNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
      <div className="grid grid-cols-6 h-16">
        {mobileMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                isActive
                  ? "text-slate-900"
                  : "text-slate-400"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
