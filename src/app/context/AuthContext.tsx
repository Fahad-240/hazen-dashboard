import { createContext, useContext, ReactNode } from "react";
import { User, Permissions, getPermissionsForRole, REGULAR_ADMIN_PERMISSIONS } from "../types/auth";

interface AuthContextType {
  user: User | null;
  permissions: Permissions;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  refreshUser?: () => Promise<void>;
}

// Default permissions (all false) for when user is not logged in
const DEFAULT_PERMISSIONS: Permissions = {
  view_users: false,
  manage_users: false,
  ban_users: false,
  delete_users: false,
  grant_admin: false,
  adjust_balances: false,
  export_user_data: false,
  impersonate_users: false,
  view_deals: false,
  manage_deals: false,
  adjust_deal_amounts: false,
  force_release_escrow: false,
  delete_deals: false,
  view_gigs: false,
  manage_gigs: false,
  moderate_content: false,
  manage_verifications: false,
  manage_support: false,
  view_analytics: false,
  export_reports: false,
  manage_rewards: false,
  create_rewards: false,
  system_settings: false,
  api_management: false,
  feature_flags: false,
};

const defaultContextValue: AuthContextType = {
  user: null,
  permissions: DEFAULT_PERMISSIONS,
  isSuperAdmin: false,
  isAdmin: false,
};

const AuthContext = createContext<AuthContextType>(defaultContextValue);

export function AuthProvider({
  children,
  user,
  refreshUser,
}: {
  children: ReactNode;
  user: User | null;
  refreshUser?: () => Promise<void>;
}) {
  const permissions = user ? getPermissionsForRole(user.role) : DEFAULT_PERMISSIONS;
  
  // Check if user is super admin - handle different role formats
  const userRole = user?.role?.toLowerCase()?.trim() || "";
  const userEmail = user?.email?.toLowerCase()?.trim() || "";
  
  const isSuperAdmin = 
    userRole === "superadmin" || 
    userRole === "super_admin" ||
    userEmail === "admin@sourceimpact.com" ||
    userEmail === "superadmin@sourceimpact.com" ||
    userEmail.includes("superadmin");
  
  const isAdmin = userRole === "admin" || isSuperAdmin;

  return (
    <AuthContext.Provider value={{ user, permissions, isSuperAdmin, isAdmin, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

