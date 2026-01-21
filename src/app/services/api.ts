// Use proxy in development, direct URL in production
// In development, Vite proxy will handle CORS
const API_BASE_URL = "/api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    user: {
      id: string;
      email: string;
      name: string;
      role?: "superadmin" | "admin" | "SUPER_ADMIN" | "ADMIN" | string;
      permissions?: string[];
    };
    token?: string;
  };
  error?: string;
}

export async function adminLogin(email: string, password: string): Promise<LoginResponse> {
  try {
    const loginPayload = {
      email: email.trim().toLowerCase(),
      password: password.trim(),
    };
    
    console.log("Login attempt with:", { email: loginPayload.email, passwordLength: loginPayload.password.length });
    
    // Try /admin/login first, fallback to /auth/login if needed
    let response;
    let data;
    let endpoint = `${API_BASE_URL}/admin/login`;
    
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginPayload),
      });

      data = await response.json();
      console.log("Login API response from /admin/login:", { status: response.status, statusText: response.statusText, data });

      // If 404, try /auth/login instead
      if (response.status === 404) {
        console.log("Endpoint /admin/login not found, trying /auth/login");
        endpoint = `${API_BASE_URL}/auth/login`;
        response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginPayload),
        });
        data = await response.json();
        console.log("Login API response from /auth/login:", { status: response.status, statusText: response.statusText, data });
      }
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      // Try alternative endpoint
      console.log("Trying alternative endpoint /auth/login");
      endpoint = `${API_BASE_URL}/auth/login`;
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginPayload),
      });
      data = await response.json();
      console.log("Login API response from /auth/login:", { status: response.status, statusText: response.statusText, data });
    }

    if (!response.ok) {
      const errorMessage = data.message || data.error || data.detail || data.msg || "Invalid credentials. Please check your email and password.";
      console.error("Login failed:", errorMessage, "Full response:", data);
      return {
        success: false,
        error: errorMessage,
      };
    }

    console.log("Login successful, response data:", data);
    
    // Handle different response formats
    // Backend format: { token: "...", user: {...} }
    // Alternative formats: { data: { user: {...}, token: "..." } } or { user: {...}, accessToken: "..." }
    
    let userData = null;
    let token = null;
    
    // Format 1: { token: "...", user: {...} } - Direct format from backend
    if (data.user && data.token) {
      userData = data.user;
      token = data.token;
    }
    // Format 2: { data: { user: {...}, token: "..." } }
    else if (data.data && data.data.user) {
      userData = data.data.user;
      token = data.data.token || data.data.accessToken;
    }
    // Format 3: { user: {...}, accessToken: "..." }
    else if (data.user) {
      userData = data.user;
      token = data.token || data.accessToken || data.refreshToken;
    }
    
    if (!userData) {
      console.error("Invalid response format - no user data found:", data);
      return {
        success: false,
        error: "Invalid response from server. Please try again.",
      };
    }
    
    console.log("Extracted user data:", userData, "Token:", token ? "Present" : "Missing");
    
    return {
      success: true,
      message: data.message || "Login successful",
      data: {
        user: userData,
        token: token,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error. Please check your connection.",
    };
  }
}

// Store token in localStorage
export function storeToken(token: string) {
  localStorage.setItem("admin_token", token);
}

// Get token from localStorage
export function getToken(): string | null {
  return localStorage.getItem("admin_token");
}

// Remove token from localStorage
export function removeToken() {
  localStorage.removeItem("admin_token");
}

// Admin logout API
export interface LogoutResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function adminLogout(): Promise<LogoutResponse> {
  try {
    const token = getToken();
    if (!token) {
      console.log("No token found for logout");
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    console.log("Logging out admin...");
    
    // Use API_BASE_URL to go through Vite proxy (handles CORS)
    // Proxy will forward /api/admin/logout to http://192.168.100.68:4000/admin/logout
    const response = await fetch(`${API_BASE_URL}/admin/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("Logout API response:", { status: response.status, data });

    if (!response.ok) {
      const errorMessage = data.message || data.error || "Failed to logout";
      console.error("Logout failed:", errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }

    console.log("Logout successful");
    return {
      success: true,
      message: data.message || "Logged out successfully",
    };
  } catch (error) {
    console.error("Logout error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error. Please check your connection.",
    };
  }
}

// Get current admin user details
export interface CurrentUserResponse {
  success: boolean;
  message?: string;
  data?: {
    user: {
      id: string;
      email: string;
      name: string;
      role?: "superadmin" | "admin" | "SUPER_ADMIN" | "ADMIN" | string;
      permissions?: string[];
      avatar?: string | null;
      created_at?: string;
      updated_at?: string;
      is_active?: boolean;
      [key: string]: any; // For any additional fields
    };
  };
  error?: string;
}

export async function getCurrentAdmin(): Promise<CurrentUserResponse> {
  try {
    const token = getToken();
    if (!token) {
      console.log("No token found");
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    console.log("Fetching current admin with token:", token.substring(0, 20) + "...");
    
    const response = await fetch(`${API_BASE_URL}/admin/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("Admin/me response:", data);

    if (!response.ok) {
      console.error("Admin/me failed:", data);
      return {
        success: false,
        error: data.message || data.error || "Failed to fetch user data",
      };
    }

    // Handle different response formats
    let userData = null;
    if (data.data && data.data.user) {
      userData = data.data;
    } else if (data.user) {
      userData = { user: data.user };
    } else if (data) {
      userData = { user: data };
    }

    if (!userData || !userData.user) {
      console.error("Invalid response format:", data);
      return {
        success: false,
        error: "Invalid response format from server",
      };
    }

    console.log("User data extracted:", userData);
    return {
      success: true,
      message: data.message || "User data fetched successfully",
      data: userData,
    };
  } catch (error) {
    console.error("Get current admin error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error. Please check your connection.",
    };
  }
}

// Get all users list
export interface UserListItem {
  id: string;
  email: string;
  name: string;
  role: string;
  status?: string;
  verified?: boolean;
  joinDate?: string;
  created_at?: string;
  is_active?: boolean;
  deals?: number;
  spent?: string;
  [key: string]: any;
}

export interface UsersListResponse {
  success: boolean;
  message?: string;
  data?: {
    users: UserListItem[];
    total?: number;
    page?: number;
    limit?: number;
  };
  error?: string;
}

export async function getUsersList(params?: {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
}): Promise<UsersListResponse> {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    // Build query string
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.role) queryParams.append("role", params.role);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.search) queryParams.append("search", params.search);

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/admin/users${queryString ? `?${queryString}` : ""}`;

    console.log("Fetching users from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("Users API response:", data);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to fetch users",
      };
    }

    // Handle different response formats
    let usersData = null;
    if (data.data && Array.isArray(data.data.users)) {
      usersData = data.data;
    } else if (data.data && Array.isArray(data.data)) {
      usersData = { users: data.data };
    } else if (Array.isArray(data.users)) {
      usersData = { users: data.users };
    } else if (Array.isArray(data)) {
      usersData = { users: data };
    }

    return {
      success: true,
      message: data.message || "Users fetched successfully",
      data: usersData || { users: [] },
    };
  } catch (error) {
    console.error("Get users list error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error. Please check your connection.",
    };
  }
}

// Update user role
export interface UpdateUserRoleResponse {
  success: boolean;
  message?: string;
  data?: {
    user: UserListItem;
  };
  error?: string;
}

export async function updateUserRole(
  userId: string,
  role: string
): Promise<UpdateUserRoleResponse> {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    const url = `${API_BASE_URL}/admin/users/${userId}/role`;

    console.log("Updating user role:", url, { role });

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });

    const data = await response.json();
    console.log("Update user role response:", data);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to update user role",
      };
    }

    return {
      success: true,
      message: data.message || "User role updated successfully",
      data: {
        user: data.user || data.data?.user,
      },
    };
  } catch (error) {
    console.error("Update user role error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error. Please check your connection.",
    };
  }
}

// Ban User
export interface BanUserResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    email: string;
    is_active: boolean;
    banned_at?: string;
    ban_reason?: string;
  };
  error?: string;
}

export async function banUser(
  userId: string,
  reason: string
): Promise<BanUserResponse> {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    const url = `${API_BASE_URL}/admin/users/${userId}/ban`;

    console.log("Banning user:", url, { reason });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    });

    const data = await response.json();
    console.log("Ban user response:", data);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to ban user",
      };
    }

    return {
      success: true,
      message: data.message || "User banned successfully",
      data: data.data || data,
    };
  } catch (error) {
    console.error("Ban user error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error. Please check your connection.",
    };
  }
}

// Unban User
export interface UnbanUserResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    is_active: boolean;
    banned_at?: string | null;
  };
  error?: string;
}

export async function unbanUser(
  userId: string
): Promise<UnbanUserResponse> {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    const url = `${API_BASE_URL}/admin/users/${userId}/unban`;

    console.log("Unbanning user:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("Unban user response:", data);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to unban user",
      };
    }

    return {
      success: true,
      message: data.message || "User unbanned successfully",
      data: data.data || data,
    };
  } catch (error) {
    console.error("Unban user error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error. Please check your connection.",
    };
  }
}

// Delete User
export interface DeleteUserResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    is_active: boolean;
  };
  error?: string;
}

export async function deleteUser(
  userId: string
): Promise<DeleteUserResponse> {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    const url = `${API_BASE_URL}/admin/users/${userId}`;

    console.log("Deleting user:", url);

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("Delete user response:", data);
    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || `Failed to delete user (Status: ${response.status})`,
      };
    }

    // Handle different response structures
    const successMessage = data.message || "User deleted successfully";
    const userData = data.user || data.data || data;

    return {
      success: true,
      message: successMessage,
      data: userData,
    };
  } catch (error) {
    console.error("Delete user error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error. Please check your connection.",
    };
  }
}

// Get User Moderation History
export interface ModerationHistoryItem {
  action: string;
  reason?: string;
  performed_by: string;
  created_at: string;
}

export interface ModerationHistoryResponse {
  success: boolean;
  message?: string;
  data?: {
    moderationHistory: ModerationHistoryItem[];
  };
  error?: string;
}

export async function getUserModerationHistory(
  userId: string
): Promise<ModerationHistoryResponse> {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    const url = `${API_BASE_URL}/admin/users/${userId}/moderation-history`;

    console.log("Fetching moderation history from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("Moderation history response:", data);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to fetch moderation history",
      };
    }

    return {
      success: true,
      message: data.message || "Moderation history fetched successfully",
      data: {
        moderationHistory: data.moderationHistory || data.data?.moderationHistory || [],
      },
    };
  } catch (error) {
    console.error("Get moderation history error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error. Please check your connection.",
    };
  }
}

// Get Banned Users List
export interface BannedUser {
  id: string;
  email: string;
  name?: string;
  banned_at: string;
  ban_reason?: string;
  [key: string]: any;
}

export interface BannedUsersListResponse {
  success: boolean;
  message?: string;
  data?: {
    bannedUsers: BannedUser[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

export async function getBannedUsersList(params?: {
  page?: number;
  limit?: number;
}): Promise<BannedUsersListResponse> {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    // Build query string
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/admin/banned-users${queryString ? `?${queryString}` : ""}`;

    console.log("Fetching banned users from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("Banned users API response:", data);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to fetch banned users",
      };
    }

    // Handle different response formats
    let bannedUsersData = null;
    if (data.bannedUsers && Array.isArray(data.bannedUsers)) {
      bannedUsersData = {
        bannedUsers: data.bannedUsers,
        pagination: data.pagination || {
          page: params?.page || 1,
          limit: params?.limit || 10,
          total: data.bannedUsers.length,
          totalPages: 1,
        },
      };
    } else if (data.data) {
      bannedUsersData = data.data;
    } else if (Array.isArray(data)) {
      bannedUsersData = {
        bannedUsers: data,
        pagination: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          total: data.length,
          totalPages: 1,
        },
      };
    }

    return {
      success: true,
      message: data.message || "Banned users fetched successfully",
      data: bannedUsersData || { bannedUsers: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } },
    };
  } catch (error) {
    console.error("Get banned users list error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error. Please check your connection.",
    };
  }
}

// List Influencers
export interface InfluencersListResponse {
  success: boolean;
  message?: string;
  data?: {
    influencers: UserListItem[];
    total?: number;
    page?: number;
    limit?: number;
  };
  error?: string;
}

export async function getInfluencersList(params?: {
  page?: number;
  limit?: number;
}): Promise<InfluencersListResponse> {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    // Build query string
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/admin/influencers${queryString ? `?${queryString}` : ""}`;

    console.log("Fetching influencers from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("Influencers API response:", data);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to fetch influencers",
      };
    }

    // Handle different response formats
    let influencersData = null;
    if (data.data && Array.isArray(data.data.influencers)) {
      influencersData = data.data;
    } else if (data.data && Array.isArray(data.data)) {
      influencersData = { influencers: data.data };
    } else if (Array.isArray(data.influencers)) {
      influencersData = { influencers: data.influencers };
    } else if (Array.isArray(data)) {
      influencersData = { influencers: data };
    }

    return {
      success: true,
      message: data.message || "Influencers fetched successfully",
      data: influencersData || { influencers: [] },
    };
  } catch (error) {
    console.error("Get influencers list error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error. Please check your connection.",
    };
  }
}

// List Sponsors
export interface SponsorsListResponse {
  success: boolean;
  message?: string;
  data?: {
    sponsors: UserListItem[];
    total?: number;
    page?: number;
    limit?: number;
  };
  error?: string;
}

export async function getSponsorsList(params?: {
  page?: number;
  limit?: number;
}): Promise<SponsorsListResponse> {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    // Build query string
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/admin/sponsors${queryString ? `?${queryString}` : ""}`;

    console.log("Fetching sponsors from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("Sponsors API response:", data);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to fetch sponsors",
      };
    }

    // Handle different response formats
    let sponsorsData = null;
    if (data.data && Array.isArray(data.data.sponsors)) {
      sponsorsData = data.data;
    } else if (data.data && Array.isArray(data.data)) {
      sponsorsData = { sponsors: data.data };
    } else if (Array.isArray(data.sponsors)) {
      sponsorsData = { sponsors: data.sponsors };
    } else if (Array.isArray(data)) {
      sponsorsData = { sponsors: data };
    }

    return {
      success: true,
      message: data.message || "Sponsors fetched successfully",
      data: sponsorsData || { sponsors: [] },
    };
  } catch (error) {
    console.error("Get sponsors list error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error. Please check your connection.",
    };
  }
}

// List Agents
export interface AgentsListResponse {
  success: boolean;
  message?: string;
  data?: {
    agents: UserListItem[];
    total?: number;
    page?: number;
    limit?: number;
  };
  error?: string;
}

export async function getAgentsList(params?: {
  page?: number;
  limit?: number;
}): Promise<AgentsListResponse> {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    // Build query string
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/admin/agents${queryString ? `?${queryString}` : ""}`;

    console.log("Fetching agents from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("Agents API response:", data);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to fetch agents",
      };
    }

    // Handle different response formats
    let agentsData = null;
    if (data.data && Array.isArray(data.data.agents)) {
      agentsData = data.data;
    } else if (data.data && Array.isArray(data.data)) {
      agentsData = { agents: data.data };
    } else if (Array.isArray(data.agents)) {
      agentsData = { agents: data.agents };
    } else if (Array.isArray(data)) {
      agentsData = { agents: data };
    }

    return {
      success: true,
      message: data.message || "Agents fetched successfully",
      data: agentsData || { agents: [] },
    };
  } catch (error) {
    console.error("Get agents list error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error. Please check your connection.",
    };
  }
}

// Get Agent Performance
export interface AgentPerformance {
  agent_id: string;
  total_deals?: number;
  total_revenue?: number;
  successful_deals?: number;
  failed_deals?: number;
  average_deal_value?: number;
  commission_earned?: number;
  rating?: number;
  [key: string]: any;
}

export interface AgentPerformanceResponse {
  success: boolean;
  message?: string;
  data?: {
    performance: AgentPerformance;
  };
  error?: string;
}

export async function getAgentPerformance(
  agentId: string
): Promise<AgentPerformanceResponse> {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    const url = `${API_BASE_URL}/admin/agents/${agentId}/performance`;

    console.log("Fetching agent performance from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("Agent performance API response:", data);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to fetch agent performance",
      };
    }

    // Handle different response formats
    let performanceData = null;
    if (data.data && data.data.performance) {
      performanceData = { performance: data.data.performance };
    } else if (data.data) {
      performanceData = { performance: data.data };
    } else if (data.performance) {
      performanceData = { performance: data.performance };
    } else {
      performanceData = { performance: data };
    }

    return {
      success: true,
      message: data.message || "Agent performance fetched successfully",
      data: performanceData,
    };
  } catch (error) {
    console.error("Get agent performance error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error. Please check your connection.",
    };
  }
}

// Gigs API
export interface Gig {
  id: string;
  title: string;
  description?: string;
  status: "open" | "in_progress" | "completed" | "cancelled";
  created_at: string;
  price?: number | string;
  [key: string]: any; // For additional fields
}

export interface GigsListResponse {
  success: boolean;
  message?: string;
  data?: {
    gigs: Gig[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

export async function getGigsList(params?: {
  page?: number;
  limit?: number;
  status?: "open" | "in_progress" | "completed" | "cancelled";
}): Promise<GigsListResponse> {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    // Build query string
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/admin/gigs${queryString ? `?${queryString}` : ""}`;

    console.log("Fetching gigs from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("Gigs API response:", data);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to fetch gigs",
      };
    }

    // Handle different response formats
    let gigsData = null;
    if (data.gigs && Array.isArray(data.gigs)) {
      gigsData = {
        gigs: data.gigs,
        pagination: data.pagination || {
          page: params?.page || 1,
          limit: params?.limit || 10,
          total: data.gigs.length,
          totalPages: 1,
        },
      };
    } else if (data.data) {
      gigsData = data.data;
    }

    return {
      success: true,
      message: data.message || "Gigs fetched successfully",
      data: gigsData || { gigs: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } },
    };
  } catch (error) {
    console.error("Get gigs list error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error. Please check your connection.",
    };
  }
}

// Get Gig by ID
export interface GetGigResponse {
  success: boolean;
  message?: string;
  data?: {
    gig: Gig;
  };
  error?: string;
}

export async function getGigById(gigId: string): Promise<GetGigResponse> {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    const url = `${API_BASE_URL}/admin/gigs/${gigId}`;

    console.log("Fetching gig by ID from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("Get gig by ID response:", data);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to fetch gig",
      };
    }

    // Handle different response formats
    let gigData = null;
    if (data.data && data.data.gig) {
      gigData = { gig: data.data.gig };
    } else if (data.gig) {
      gigData = { gig: data.gig };
    } else if (data.data) {
      gigData = { gig: data.data };
    } else {
      gigData = { gig: data };
    }

    return {
      success: true,
      message: data.message || "Gig fetched successfully",
      data: gigData,
    };
  } catch (error) {
    console.error("Get gig by ID error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error. Please check your connection.",
    };
  }
}

// Update Gig Status API
export interface UpdateGigStatusResponse {
  success: boolean;
  message?: string;
  data?: {
    gig: Gig;
  };
  error?: string;
}

export async function updateGigStatus(
  gigId: string,
  status: "open" | "in_progress" | "completed" | "cancelled"
): Promise<UpdateGigStatusResponse> {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    const url = `${API_BASE_URL}/admin/gigs/${gigId}/status`;

    console.log("Updating gig status:", url, { status });

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();
    console.log("Update gig status response:", data);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to update gig status",
      };
    }

    return {
      success: true,
      message: data.message || "Gig status updated successfully",
      data: {
        gig: data.gig || data.data?.gig,
      },
    };
  } catch (error) {
    console.error("Update gig status error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error. Please check your connection.",
    };
  }
}

// Delete Gig API
export interface DeleteGigResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
  };
  error?: string;
}

export async function deleteGig(
  gigId: string
): Promise<DeleteGigResponse> {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    const url = `${API_BASE_URL}/admin/gigs/${gigId}`;

    console.log("Deleting gig:", url);

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("Delete gig response:", data);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to delete gig",
      };
    }

    return {
      success: true,
      message: data.message || "Gig deleted successfully",
      data: data.data || { id: gigId },
    };
  } catch (error) {
    console.error("Delete gig error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error. Please check your connection.",
    };
  }
}

// Flag Gig API
export interface FlagGigResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    flagged: boolean;
    flagged_at?: string;
    flagged_reason?: string;
  };
  error?: string;
}

export async function flagGig(
  gigId: string,
  reason: string
): Promise<FlagGigResponse> {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    const url = `${API_BASE_URL}/admin/gigs/${gigId}/flag`;

    console.log("Flagging gig:", url, { reason });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    });

    const data = await response.json();
    console.log("Flag gig response:", data);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to flag gig",
      };
    }

    return {
      success: true,
      message: data.message || "Gig flagged successfully",
      data: data.data || data,
    };
  } catch (error) {
    console.error("Flag gig error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error. Please check your connection.",
    };
  }
}

// Get Flagged Content API
export interface FlaggedGig {
  id: string;
  title?: string;
  flagged: boolean;
  flagged_reason?: string;
  flagged_at?: string;
  sponsor_name?: string;
  sponsor_email?: string;
}

export interface FlaggedContentResponse {
  success: boolean;
  message?: string;
  data?: {
    flaggedContent: {
      gigs: FlaggedGig[];
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

export async function getFlaggedContent(params?: {
  page?: number;
  limit?: number;
}): Promise<FlaggedContentResponse> {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    // Build query string
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/admin/flagged-content${queryString ? `?${queryString}` : ""}`;

    console.log("Fetching flagged content from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("Flagged content API response:", data);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to fetch flagged content",
      };
    }

    // Handle different response formats
    let flaggedData = null;
    if (data.flaggedContent) {
      flaggedData = {
        flaggedContent: data.flaggedContent,
        pagination: data.pagination || {
          page: params?.page || 1,
          limit: params?.limit || 10,
          total: data.flaggedContent?.gigs?.length || 0,
          totalPages: 1,
        },
      };
    } else if (data.data) {
      flaggedData = data.data;
    } else {
      flaggedData = {
        flaggedContent: { gigs: [] },
        pagination: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          total: 0,
          totalPages: 0,
        },
      };
    }

    return {
      success: true,
      message: data.message || "Flagged content fetched successfully",
      data: flaggedData,
    };
  } catch (error) {
    console.error("Get flagged content error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error. Please check your connection.",
    };
  }
}

// Dashboard Analytics API
export interface DashboardAnalytics {
  users: {
    total: number;
    active: number;
    byRole: {
      influencer?: number;
      sponsor?: number;
      agent?: number;
      admin?: number;
      [key: string]: number | undefined;
    };
  };
  gigs: {
    total: number;
    byStatus: {
      active?: number;
      closed?: number;
      pending?: number;
      [key: string]: number | undefined;
    };
  };
  transactions: {
    total: number;
    revenueLastMonth: number;
  };
}

export interface DashboardAnalyticsResponse {
  success: boolean;
  message?: string;
  data?: DashboardAnalytics;
  error?: string;
}

export async function getDashboardAnalytics(): Promise<DashboardAnalyticsResponse> {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    const url = `${API_BASE_URL}/admin/analytics/dashboard`;

    console.log("Fetching dashboard analytics from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("Dashboard analytics API response:", data);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to fetch dashboard analytics",
      };
    }

    return {
      success: true,
      message: data.message || "Dashboard analytics fetched successfully",
      data: data,
    };
  } catch (error) {
    console.error("Get dashboard analytics error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error. Please check your connection.",
    };
  }
}

// Escrow Jobs API
export interface EscrowJob {
  id: string;
  amount: number;
  status: "locked" | "released" | "disputed" | "releasing" | "refunded";
  sponsor?: {
    id: string;
    name: string;
    email?: string;
  };
  influencer?: {
    id: string;
    name: string;
    email?: string;
  };
  sponsor_id?: string;
  influencer_id?: string;
  dispute_reason?: string;
  disputed_at?: string;
  dispute_resolution?: "release" | "refund";
  dispute_resolution_reason?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EscrowJobsResponse {
  success: boolean;
  message?: string;
  data?: {
    escrowJobs: EscrowJob[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

export async function getEscrowJobs(params?: {
  page?: number;
  limit?: number;
  status?: "locked" | "released" | "disputed" | "releasing" | "refunded";
}): Promise<EscrowJobsResponse> {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/admin/escrow-jobs${queryString ? `?${queryString}` : ""}`;

    console.log("Fetching escrow jobs from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("Escrow jobs API response:", data);

    if (!response.ok) {
      const errorMessage = data.message || data.error || "Failed to fetch escrow jobs";
      console.error("Escrow jobs API error:", errorMessage, "Status:", response.status);
      return {
        success: false,
        error: errorMessage,
      };
    }

    let escrowData = null;
    if (data.escrowJobs) {
      escrowData = {
        escrowJobs: data.escrowJobs,
        pagination: data.pagination || {
          page: params?.page || 1,
          limit: params?.limit || 10,
          total: data.escrowJobs?.length || 0,
          totalPages: 1,
        },
      };
    } else if (data.data) {
      escrowData = data.data;
    } else {
      escrowData = {
        escrowJobs: [],
        pagination: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          total: 0,
          totalPages: 0,
        },
      };
    }

    return {
      success: true,
      message: data.message || "Escrow jobs fetched successfully",
      data: escrowData,
    };
  } catch (error) {
    console.error("Get escrow jobs error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error. Please check your connection.",
    };
  }
}

export interface GetEscrowJobResponse {
  success: boolean;
  message?: string;
  data?: EscrowJob;
  error?: string;
}

export async function getEscrowJobById(escrowId: string): Promise<GetEscrowJobResponse> {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    const url = `${API_BASE_URL}/admin/escrow-jobs/${escrowId}`;

    console.log("Fetching escrow job:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("Escrow job API response:", data);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to fetch escrow job",
      };
    }

    return {
      success: true,
      message: data.message || "Escrow job fetched successfully",
      data: data.data || data,
    };
  } catch (error) {
    console.error("Get escrow job error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error. Please check your connection.",
    };
  }
}

export interface UpdateEscrowStatusResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    status: string;
  };
  error?: string;
}

export async function updateEscrowStatus(
  escrowId: string,
  status: "released" | "locked" | "refunded"
): Promise<UpdateEscrowStatusResponse> {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    const url = `${API_BASE_URL}/admin/escrow-jobs/${escrowId}/status`;

    console.log("Updating escrow status:", url, { status });

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();
    console.log("Update escrow status response:", data);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to update escrow status",
      };
    }

    return {
      success: true,
      message: data.message || "Escrow status updated successfully",
      data: data.escrowJob || data.data || data,
    };
  } catch (error) {
    console.error("Update escrow status error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error. Please check your connection.",
    };
  }
}

export interface DisputeEscrowResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    status: string;
    dispute_reason?: string;
    disputed_at?: string;
  };
  error?: string;
}

export async function disputeEscrowJob(
  escrowId: string,
  reason: string
): Promise<DisputeEscrowResponse> {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    const url = `${API_BASE_URL}/admin/escrow-jobs/${escrowId}/dispute`;

    console.log("Disputing escrow job:", url, { reason });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    });

    const data = await response.json();
    console.log("Dispute escrow response:", data);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to dispute escrow job",
      };
    }

    return {
      success: true,
      message: data.message || "Escrow job disputed successfully",
      data: data.data || data,
    };
  } catch (error) {
    console.error("Dispute escrow error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error. Please check your connection.",
    };
  }
}

export interface ResolveEscrowDisputeResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    status: string;
    dispute_resolution?: string;
    dispute_resolution_reason?: string;
  };
  error?: string;
}

export async function resolveEscrowDispute(
  escrowId: string,
  resolution: "release" | "refund",
  resolutionReason: string
): Promise<ResolveEscrowDisputeResponse> {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    const url = `${API_BASE_URL}/admin/escrow-jobs/${escrowId}/resolve-dispute`;

    console.log("Resolving escrow dispute:", url, { resolution, resolutionReason });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        resolution,
        resolution_reason: resolutionReason,
      }),
    });

    const data = await response.json();
    console.log("Resolve escrow dispute response:", data);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to resolve escrow dispute",
      };
    }

    return {
      success: true,
      message: data.message || "Dispute resolved successfully",
      data: data.data || data,
    };
  } catch (error) {
    console.error("Resolve escrow dispute error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error. Please check your connection.",
    };
  }
}

export interface DisputedEscrowsResponse {
  success: boolean;
  message?: string;
  data?: {
    disputedEscrows: EscrowJob[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

export async function getDisputedEscrows(params?: {
  page?: number;
  limit?: number;
}): Promise<DisputedEscrowsResponse> {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/admin/escrow-jobs/disputed${queryString ? `?${queryString}` : ""}`;

    console.log("Fetching disputed escrows from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("Disputed escrows API response:", data);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to fetch disputed escrows",
      };
    }

    let disputedData = null;
    if (data.disputedEscrows) {
      disputedData = {
        disputedEscrows: data.disputedEscrows,
        pagination: data.pagination || {
          page: params?.page || 1,
          limit: params?.limit || 10,
          total: data.disputedEscrows?.length || 0,
          totalPages: 1,
        },
      };
    } else if (data.data) {
      disputedData = data.data;
    } else {
      disputedData = {
        disputedEscrows: [],
        pagination: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          total: 0,
          totalPages: 0,
        },
      };
    }

    return {
      success: true,
      message: data.message || "Disputed escrows fetched successfully",
      data: disputedData,
    };
  } catch (error) {
    console.error("Get disputed escrows error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error. Please check your connection.",
    };
  }
}

export interface Dispute {
  id: string;
  status: string;
  dispute_reason?: string;
  disputed_at?: string;
  dispute_resolution?: string;
  dispute_resolution_reason?: string;
  escrow_id?: string;
}

export interface AllDisputesResponse {
  success: boolean;
  message?: string;
  data?: {
    disputes: Dispute[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

export async function getAllDisputes(params?: {
  page?: number;
  limit?: number;
}): Promise<AllDisputesResponse> {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/admin/disputes${queryString ? `?${queryString}` : ""}`;

    console.log("Fetching all disputes from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("All disputes API response:", data);

    if (!response.ok) {
      const errorMessage = data.message || data.error || "Failed to fetch disputes";
      console.error("All disputes API error:", errorMessage, "Status:", response.status);
      return {
        success: false,
        error: errorMessage,
      };
    }

    let disputesData = null;
    if (data.disputes) {
      disputesData = {
        disputes: data.disputes,
        pagination: data.pagination || {
          page: params?.page || 1,
          limit: params?.limit || 10,
          total: data.disputes?.length || 0,
          totalPages: 1,
        },
      };
    } else if (data.data) {
      disputesData = data.data;
    } else {
      disputesData = {
        disputes: [],
        pagination: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          total: 0,
          totalPages: 0,
        },
      };
    }

    return {
      success: true,
      message: data.message || "Disputes fetched successfully",
      data: disputesData,
    };
  } catch (error) {
    console.error("Get all disputes error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error. Please check your connection.",
    };
  }
}

export interface ResolveDisputeResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    status: string;
    dispute_resolution?: string;
    dispute_resolution_reason?: string;
  };
  error?: string;
}

export async function resolveDispute(
  disputeId: string,
  resolution: "release" | "refund",
  resolutionReason: string
): Promise<ResolveDisputeResponse> {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    const url = `${API_BASE_URL}/admin/disputes/${disputeId}/resolve`;

    console.log("Resolving dispute:", url, { resolution, resolutionReason });

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        resolution,
        resolution_reason: resolutionReason,
      }),
    });

    const data = await response.json();
    console.log("Resolve dispute response:", data);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to resolve dispute",
      };
    }

    return {
      success: true,
      message: data.message || "Dispute resolved successfully",
      data: data.data || data,
    };
  } catch (error) {
    console.error("Resolve dispute error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error. Please check your connection.",
    };
  }
}

// ==================== Rewards APIs ====================

// Get User Rewards
export interface UserReward {
  id: string;
  user_id: string;
  reward_name: string;
  reward_type: string;
  amount: number;
  status: string;
}

export interface GetUserRewardsResponse {
  success: boolean;
  message?: string;
  data?: {
    userRewards: UserReward[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

export async function getUserRewards(params?: {
  page?: number;
  limit?: number;
}): Promise<GetUserRewardsResponse> {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/admin/user-rewards${queryString ? `?${queryString}` : ""}`;

    console.log("Fetching user rewards from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("Get user rewards API response:", data);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to fetch user rewards",
      };
    }

    let rewardsData = null;
    if (data.userRewards) {
      rewardsData = {
        userRewards: data.userRewards,
        pagination: data.pagination || {
          page: params?.page || 1,
          limit: params?.limit || 10,
          total: data.userRewards?.length || 0,
          totalPages: 1,
        },
      };
    } else if (data.data) {
      rewardsData = data.data;
    } else {
      rewardsData = {
        userRewards: [],
        pagination: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          total: 0,
          totalPages: 0,
        },
      };
    }

    return {
      success: true,
      message: data.message || "User rewards fetched successfully",
      data: rewardsData,
    };
  } catch (error) {
    console.error("Get user rewards error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error. Please check your connection.",
    };
  }
}

// Create Reward Trigger
export interface CreateRewardTriggerRequest {
  name: string;
  description?: string;
  trigger_type: string;
  conditions?: Record<string, any>;
  reward_type: string;
  reward_value: number;
  is_active?: boolean;
}

export interface RewardTrigger {
  id: string;
  name: string;
  description?: string;
  trigger_type: string;
  conditions?: Record<string, any>;
  reward_type: string;
  reward_value: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateRewardTriggerResponse {
  success: boolean;
  message?: string;
  data?: RewardTrigger;
  error?: string;
}

export async function createRewardTrigger(
  triggerData: CreateRewardTriggerRequest
): Promise<CreateRewardTriggerResponse> {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    const url = `${API_BASE_URL}/admin/rewards/triggers`;

    console.log("Creating reward trigger:", url, triggerData);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: triggerData.name,
        description: triggerData.description,
        trigger_type: triggerData.trigger_type,
        conditions: triggerData.conditions,
        reward_type: triggerData.reward_type,
        reward_value: triggerData.reward_value,
        is_active: triggerData.is_active !== undefined ? triggerData.is_active : true,
      }),
    });

    const data = await response.json();
    console.log("Create reward trigger response:", data);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to create reward trigger",
      };
    }

    return {
      success: true,
      message: data.message || "Reward trigger created successfully",
      data: data.data || data,
    };
  } catch (error) {
    console.error("Create reward trigger error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error. Please check your connection.",
    };
  }
}

// Update Reward Trigger
export interface UpdateRewardTriggerRequest {
  name?: string;
  description?: string;
  trigger_type?: string;
  conditions?: Record<string, any>;
  reward_type?: string;
  reward_value?: number;
  is_active?: boolean;
}

export interface UpdateRewardTriggerResponse {
  success: boolean;
  message?: string;
  data?: RewardTrigger;
  error?: string;
}

export async function updateRewardTrigger(
  triggerId: string,
  triggerData: UpdateRewardTriggerRequest
): Promise<UpdateRewardTriggerResponse> {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    const url = `${API_BASE_URL}/admin/rewards/triggers/${triggerId}`;

    console.log("Updating reward trigger:", url, triggerData);

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(triggerData),
    });

    const data = await response.json();
    console.log("Update reward trigger response:", data);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to update reward trigger",
      };
    }

    return {
      success: true,
      message: data.message || "Reward trigger updated successfully",
      data: data.data || data,
    };
  } catch (error) {
    console.error("Update reward trigger error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error. Please check your connection.",
    };
  }
}

// Get Reward Triggers
export interface GetRewardTriggersResponse {
  success: boolean;
  message?: string;
  data?: {
    rewardTriggers: RewardTrigger[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

export async function getRewardTriggers(params?: {
  page?: number;
  limit?: number;
  is_active?: boolean;
}): Promise<GetRewardTriggersResponse> {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.is_active !== undefined) queryParams.append("is_active", params.is_active.toString());

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/admin/rewards/triggers${queryString ? `?${queryString}` : ""}`;

    console.log("Fetching reward triggers from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("Get reward triggers API response:", data);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to fetch reward triggers",
      };
    }

    let triggersData = null;
    let triggers = [];
    
    if (data.rewardTriggers) {
      triggers = data.rewardTriggers;
    } else if (data.data?.rewardTriggers) {
      triggers = data.data.rewardTriggers;
    } else if (data.data && Array.isArray(data.data)) {
      triggers = data.data;
    }
    
    // Normalize trigger data - handle different field name formats
    triggers = triggers.map((trigger: any) => {
      console.log("Raw trigger from API:", trigger);
      return {
        ...trigger,
        trigger_type: trigger.trigger_type || trigger.triggerType || "",
        reward_type: trigger.reward_type || trigger.rewardType || "",
        reward_value: trigger.reward_value || trigger.rewardValue || 0,
        is_active: trigger.is_active !== undefined ? trigger.is_active : (trigger.isActive !== undefined ? trigger.isActive : true),
      };
    });
    
    if (data.rewardTriggers || data.data) {
      triggersData = {
        rewardTriggers: triggers,
        pagination: data.pagination || data.data?.pagination || {
          page: params?.page || 1,
          limit: params?.limit || 10,
          total: triggers.length || 0,
          totalPages: 1,
        },
      };
    } else {
      triggersData = {
        rewardTriggers: triggers,
        pagination: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          total: 0,
          totalPages: 0,
        },
      };
    }

    return {
      success: true,
      message: data.message || "Reward triggers fetched successfully",
      data: triggersData,
    };
  } catch (error) {
    console.error("Get reward triggers error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error. Please check your connection.",
    };
  }
}