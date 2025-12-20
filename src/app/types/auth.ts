export type UserRole = "superadmin" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Permissions {
  // User Management
  view_users: boolean;
  manage_users: boolean; // Suspend, reset password
  ban_users: boolean; // Permanent ban
  delete_users: boolean;
  grant_admin: boolean;
  adjust_balances: boolean;
  export_user_data: boolean;
  impersonate_users: boolean;

  // Deal Management
  view_deals: boolean;
  manage_deals: boolean; // Approve, complete, cancel
  adjust_deal_amounts: boolean;
  force_release_escrow: boolean;
  delete_deals: boolean;

  // Gig Management
  view_gigs: boolean;
  manage_gigs: boolean; // Moderate, delete

  // Content Moderation
  moderate_content: boolean;

  // Verification
  manage_verifications: boolean;

  // Support
  manage_support: boolean;

  // Analytics
  view_analytics: boolean;
  export_reports: boolean;

  // Rewards
  manage_rewards: boolean; // View and approve
  create_rewards: boolean; // Create/modify triggers

  // System
  system_settings: boolean;
  api_management: boolean;
  feature_flags: boolean;
}

export const SUPER_ADMIN_PERMISSIONS: Permissions = {
  view_users: true,
  manage_users: true,
  ban_users: true,
  delete_users: true,
  grant_admin: true,
  adjust_balances: true,
  export_user_data: true,
  impersonate_users: true,
  view_deals: true,
  manage_deals: true,
  adjust_deal_amounts: true,
  force_release_escrow: true,
  delete_deals: true,
  view_gigs: true,
  manage_gigs: true,
  moderate_content: true,
  manage_verifications: true,
  manage_support: true,
  view_analytics: true,
  export_reports: true,
  manage_rewards: true,
  create_rewards: true,
  system_settings: true,
  api_management: true,
  feature_flags: true,
};

export const REGULAR_ADMIN_PERMISSIONS: Permissions = {
  view_users: true,
  manage_users: true, // Suspend, reset password
  ban_users: false,
  delete_users: false,
  grant_admin: false,
  adjust_balances: false,
  export_user_data: false,
  impersonate_users: false,
  view_deals: true,
  manage_deals: true, // Approve, complete, cancel
  adjust_deal_amounts: false,
  force_release_escrow: false,
  delete_deals: false,
  view_gigs: true,
  manage_gigs: true,
  moderate_content: true,
  manage_verifications: true,
  manage_support: true,
  view_analytics: true,
  export_reports: false,
  manage_rewards: true, // View and approve
  create_rewards: false,
  system_settings: false,
  api_management: false,
  feature_flags: false,
};

export function getPermissionsForRole(role: UserRole): Permissions {
  return role === "superadmin" ? SUPER_ADMIN_PERMISSIONS : REGULAR_ADMIN_PERMISSIONS;
}

// Mock users for login
export const MOCK_USERS: Record<string, { user: User; password: string; twoFactorCode: string }> = {
  "superadmin@sourceimpact.com": {
    user: {
      id: "1",
      email: "superadmin@sourceimpact.com",
      name: "Super Admin",
      role: "superadmin",
    },
    password: "superadmin123",
    twoFactorCode: "111111",
  },
  "admin@sourceimpact.com": {
    user: {
      id: "2",
      email: "admin@sourceimpact.com",
      name: "Regular Admin",
      role: "admin",
    },
    password: "admin123",
    twoFactorCode: "222222",
  },
};

