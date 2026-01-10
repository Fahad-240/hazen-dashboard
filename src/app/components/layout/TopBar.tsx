import { useState } from "react";
import { Search, Bell, User, LogOut, Settings, Menu, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    title: "New user registration",
    description: "John Doe signed up 5 minutes ago",
    time: "5m ago",
    read: false,
  },
  {
    id: "2",
    title: "Deal requires approval",
    description: "Deal #4523 is pending review",
    time: "1h ago",
    read: false,
  },
  {
    id: "3",
    title: "Payout completed",
    description: "$5,230 paid to 12 agents",
    time: "2h ago",
    read: false,
  },
];

interface TopBarProps {
  onLogout: () => void;
  onMenuToggle?: () => void;
  adminName?: string;
  adminEmail?: string;
  onViewAllNotifications?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
}

export function TopBar({
  onLogout,
  onMenuToggle,
  adminName = "Admin User",
  adminEmail = "admin@sourceimpact.com",
  onViewAllNotifications,
  onProfileClick,
  onSettingsClick,
}: TopBarProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const clearAllNotifications = () => {
    const confirmed = window.confirm("Are you sure you want to clear all notifications?");
    if (confirmed) {
      setNotifications([]);
    }
  };
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6">
      {/* Left Section */}
      <div className="flex items-center gap-4 flex-1">
        {/* Menu Toggle Button - Visible on all screens */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="h-9 w-9"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search */}
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search users, deals, transactions..."
            className="pl-10 h-9 bg-slate-50 border-slate-200"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Mobile Search */}
        <Button variant="ghost" size="icon" className="sm:hidden">
          <Search className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-600">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-2 py-1.5">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              {unreadCount > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    markAllAsRead();
                  }}
                >
                  Mark all as read
                </Button>
              )}
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-2 py-8 text-center text-sm text-slate-500">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    {...notification}
                    onClick={() => markAsRead(notification.id)}
                    onDelete={deleteNotification}
                  />
                ))
              )}
            </div>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 space-y-1">
              <DropdownMenuItem
                className="text-center justify-center cursor-pointer"
                onClick={() => {
                  if (onViewAllNotifications) {
                    onViewAllNotifications();
                  } else {
                    console.log("View all notifications clicked");
                  }
                }}
              >
                View all notifications
              </DropdownMenuItem>
              {notifications.length > 0 && (
                <DropdownMenuItem
                  className="text-center justify-center cursor-pointer text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearAllNotifications();
                  }}
                >
                  Clear all notifications
                </DropdownMenuItem>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 h-9 px-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-slate-900 text-white text-xs">
                  {adminName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium leading-none">{adminName}</p>
                <p className="text-xs text-slate-500 mt-0.5">Admin</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium">{adminName}</p>
                <p className="text-xs text-slate-500 font-normal mt-0.5">{adminEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                if (onProfileClick) {
                  onProfileClick();
                }
              }}
              className="cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (onSettingsClick) {
                  onSettingsClick();
                }
              }}
              className="cursor-pointer"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function NotificationItem({
  id,
  title,
  description,
  time,
  read,
  onClick,
  onDelete,
}: Notification & { onClick: () => void; onDelete?: (id: string) => void }) {
  return (
    <div
      className={`px-2 py-3 hover:bg-slate-50 ${
        !read ? "bg-blue-50/50" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        {!read && (
          <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
        )}
        {read && <div className="w-2 h-2 mt-1.5 flex-shrink-0" />}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={onClick}
        >
          <p
            className={`text-sm font-medium ${
              read ? "text-slate-600" : "text-slate-900"
            }`}
          >
            {title}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          <p className="text-xs text-slate-400 mt-1">{time}</p>
        </div>
        {onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-slate-400 hover:text-red-600 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
