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
