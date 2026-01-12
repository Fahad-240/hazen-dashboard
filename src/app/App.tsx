import { useState, useEffect } from "react";
import { LoginScreen } from "./components/auth/LoginScreen";
import { ForgotPasswordScreen } from "./components/auth/ForgotPasswordScreen";
import { ResetPasswordScreen } from "./components/auth/ResetPasswordScreen";
import { Sidebar } from "./components/layout/Sidebar";
import { TopBar } from "./components/layout/TopBar";
import { MobileNav } from "./components/layout/MobileNav";
import { DashboardOverview } from "./components/dashboard/DashboardOverview";
import { UserManagement } from "./components/dashboard/UserManagement";
import { DealManagement } from "./components/dashboard/DealManagement";
import { FinancialManagement } from "./components/dashboard/FinancialManagement";
import { SettingsPanel } from "./components/dashboard/SettingsPanel";
import { AgentManagement } from "./components/dashboard/AgentManagement";
import { GigManagement } from "./components/dashboard/GigManagement";
import { ContentModeration } from "./components/dashboard/ContentModeration";
import { NotificationsPanel } from "./components/dashboard/NotificationsPanel";
import { AnalyticsReports } from "./components/dashboard/AnalyticsReports";
import { RewardsPanel } from "./components/dashboard/RewardsPanel";
import { SecurityPanel } from "./components/dashboard/SecurityPanel";
import { ProfilePanel } from "./components/dashboard/ProfilePanel";
import { TokenWithdrawalsPanel } from "./components/dashboard/TokenWithdrawalsPanel";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { User } from "./types/auth";
import { AuthProvider } from "./context/AuthContext";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "./components/ui/sheet";
import { adminLogin, storeToken, removeToken, getCurrentAdmin, adminLogout } from "./services/api";

type AuthView = "login" | "forgot-password" | "reset-password";
type DashboardView =
  | "dashboard"
  | "users"
  | "deals"
  | "financials"
  | "agents"
  | "gigs"
  | "moderation"
  | "notifications"
  | "analytics"
  | "rewards"
  | "withdrawals"
  | "settings"
  | "security"
  | "profile";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<AuthView>("login");
  const [currentView, setCurrentView] = useState<DashboardView>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check if user is already logged in on app load
  useEffect(() => {
    const checkAuth = async () => {
      const { getToken } = await import("./services/api");
      const token = getToken();
      
      console.log("Checking auth, token exists:", !!token);
      
      if (token) {
        try {
          const response = await getCurrentAdmin();
          console.log("getCurrentAdmin response:", response);
          
          if (response.success && response.data?.user) {
            // Normalize role from backend
            // Priority: Email check > Role check > Permissions check
            let normalizedRole: "superadmin" | "admin" = "admin";
            const email = response.data.user.email?.toLowerCase() || "";
            const backendRole = response.data.user.role;
            const backendPermissions = response.data.user.permissions;
            
            // Priority 1: Check email to determine role (most reliable)
            // Super Admin email: admin@sourceimpact.com
            if (email === "admin@sourceimpact.com") {
              normalizedRole = "superadmin";
            }
            // Normal Admin email: normaladmin@sourceimpact.com
            else if (email === "normaladmin@sourceimpact.com") {
              normalizedRole = "admin";
            }
            // Priority 2: Check if role is directly provided and indicates superadmin
            else if (backendRole) {
              const roleLower = backendRole.toLowerCase();
              if (roleLower === "superadmin" || roleLower === "super_admin") {
                normalizedRole = "superadmin";
              } else {
                normalizedRole = "admin";
              }
            }
            // Priority 3: Check permissions array if role is not provided
            else if (backendPermissions && Array.isArray(backendPermissions)) {
              const hasSuperAdmin = backendPermissions.some(
                (p: string) => p.toUpperCase() === "SUPER_ADMIN" || p.toLowerCase() === "superadmin"
              );
              normalizedRole = hasSuperAdmin ? "superadmin" : "admin";
            }
            
            const user: User = {
              id: response.data.user.id,
              email: response.data.user.email,
              name: response.data.user.name,
              role: normalizedRole,
            };
            console.log("Auth check - Normalized role:", normalizedRole, "from backend:", backendRole || backendPermissions);
            console.log("Setting user:", user);
            setCurrentUser(user);
            setIsAuthenticated(true);
          } else {
            console.log("Auth failed, removing token. Error:", response.error);
            // Token invalid, remove it
            removeToken();
          }
        } catch (error) {
          console.error("Auth check error:", error);
          removeToken();
        }
      } else {
        console.log("No token found, showing login");
      }
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, []);

  // Function to refresh user data from backend
  const refreshUserData = async () => {
    try {
      const response = await getCurrentAdmin();
      if (response.success && response.data?.user) {
        // Normalize role from backend (same logic as checkAuth)
        let normalizedRole: "superadmin" | "admin" = "admin";
        const email = response.data.user.email?.toLowerCase() || "";
        const backendRole = response.data.user.role;
        const backendPermissions = response.data.user.permissions;
        
        if (email === "admin@sourceimpact.com") {
          normalizedRole = "superadmin";
        } else if (email === "normaladmin@sourceimpact.com") {
          normalizedRole = "admin";
        } else if (backendRole) {
          const roleLower = backendRole.toLowerCase();
          if (roleLower === "superadmin" || roleLower === "super_admin") {
            normalizedRole = "superadmin";
          } else {
            normalizedRole = "admin";
          }
        } else if (backendPermissions && Array.isArray(backendPermissions)) {
          const hasSuperAdmin = backendPermissions.some(
            (p: string) => p.toUpperCase() === "SUPER_ADMIN" || p.toLowerCase() === "superadmin"
          );
          normalizedRole = hasSuperAdmin ? "superadmin" : "admin";
        }
        
        const user: User = {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
          role: normalizedRole,
        };
        
        setCurrentUser(user);
        console.log("✅ User data refreshed:", user);
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  // Auth handlers
  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setAuthError("");
    
    console.log("handleLogin called with:", { email, passwordLength: password.length });
    
    try {
      const response = await adminLogin(email, password);
      console.log("Login response received:", response);
      
      if (response.success && response.data) {
        // Store token if available
        if (response.data.token) {
          storeToken(response.data.token);
        }
        
        // Normalize role from backend
        // Priority: Email check > Role check > Permissions check
        let normalizedRole: "superadmin" | "admin" = "admin";
        const email = response.data.user.email?.toLowerCase() || "";
        const backendRole = response.data.user.role;
        const backendPermissions = response.data.user.permissions;
        
        // Priority 1: Check email to determine role (most reliable)
        // Super Admin email: admin@sourceimpact.com
        if (email === "admin@sourceimpact.com") {
          normalizedRole = "superadmin";
        }
        // Normal Admin email: normaladmin@sourceimpact.com
        else if (email === "normaladmin@sourceimpact.com") {
          normalizedRole = "admin";
        }
        // Priority 2: Check if role is directly provided and indicates superadmin
        else if (backendRole) {
          const roleLower = backendRole.toLowerCase();
          if (roleLower === "superadmin" || roleLower === "super_admin") {
            normalizedRole = "superadmin";
          } else {
            normalizedRole = "admin";
          }
        }
        // Priority 3: Check permissions array if role is not provided
        else if (backendPermissions && Array.isArray(backendPermissions)) {
          const hasSuperAdmin = backendPermissions.some(
            (p: string) => p.toUpperCase() === "SUPER_ADMIN" || p.toLowerCase() === "superadmin"
          );
          normalizedRole = hasSuperAdmin ? "superadmin" : "admin";
        }
        
        // Set user data
        const user: User = {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
          role: normalizedRole,
        };
        
        console.log("Login - Normalized role:", normalizedRole, "from backend:", backendRole || backendPermissions);
        
        setCurrentUser(user);
        setIsAuthenticated(true);
        toast.success(`Welcome ${user.name}!`);
      } else {
        const errorMsg = response.error || "Invalid credentials. Please try again.";
        console.error("Login failed - Error:", errorMsg);
        console.error("Full response:", response);
        setAuthError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Login error:", error);
      setAuthError("An unexpected error occurred. Please try again.");
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (email: string) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    toast.success("Password reset instructions sent!");
  };

  const handleResetPassword = async (password: string) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    toast.success("Password reset successfully!");
  };


  const handleLogout = async () => {
    try {
      // Call logout API
      const response = await adminLogout();
      
      // Remove token from storage regardless of API response
      removeToken();
      
      // Clear authentication state
      setIsAuthenticated(false);
      setCurrentUser(null);
      setAuthView("login");
      setCurrentView("dashboard");
      
      // Show success message
      if (response.success) {
        toast.success(response.message || "Logged out successfully");
      } else {
        // Even if API call fails, we still logout locally
        toast.success("Logged out successfully");
        console.warn("Logout API call failed, but local logout completed:", response.error);
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Still logout locally even if API call fails
      removeToken();
      setIsAuthenticated(false);
      setCurrentUser(null);
      setAuthView("login");
      setCurrentView("dashboard");
      toast.success("Logged out successfully");
    }
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Render auth screens
  if (!isAuthenticated) {
    if (authView === "login") {
      return (
        <>
          <LoginScreen
            onLogin={handleLogin}
            onForgotPassword={() => setAuthView("forgot-password")}
            isLoading={isLoading}
            error={authError}
          />
          <Toaster />
        </>
      );
    }

    if (authView === "forgot-password") {
      return (
        <>
          <ForgotPasswordScreen
            onBack={() => setAuthView("login")}
            onSubmit={handleForgotPassword}
            isLoading={isLoading}
          />
          <Toaster />
        </>
      );
    }

    if (authView === "reset-password") {
      return (
        <>
          <ResetPasswordScreen onSubmit={handleResetPassword} isLoading={isLoading} />
          <Toaster />
        </>
      );
    }
  }

  // Render dashboard content
  const renderDashboardContent = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardOverview />;
      case "users":
        return <UserManagement />;
      case "deals":
        return <DealManagement />;
      case "financials":
        return <FinancialManagement />;
      case "agents":
        return <AgentManagement />;
      case "gigs":
        return <GigManagement />;
      case "moderation":
        return <ContentModeration />;
      case "notifications":
        return <NotificationsPanel />;
      case "analytics":
        return <AnalyticsReports />;
      case "rewards":
        return <RewardsPanel />;
      case "withdrawals":
        return <TokenWithdrawalsPanel />;
      case "settings":
        return <SettingsPanel />;
      case "security":
        return <SecurityPanel />;
      case "profile":
        return <ProfilePanel />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <AuthProvider user={currentUser} refreshUser={refreshUserData}>
      <div className="h-screen flex flex-col lg:flex-row bg-slate-50">
        {/* Sidebar - Desktop */}
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Top Bar */}
          <TopBar
            onLogout={handleLogout}
            onMenuToggle={() => {
              // On mobile, toggle mobile menu
              // On desktop, toggle sidebar
              if (window.innerWidth < 1024) {
                setMobileMenuOpen(!mobileMenuOpen);
              } else {
                setSidebarCollapsed(!sidebarCollapsed);
              }
            }}
            onViewAllNotifications={() => setCurrentView("notifications")}
            onProfileClick={() => setCurrentView("profile")}
            onSettingsClick={() => setCurrentView("settings")}
            adminName={currentUser?.name || "Admin User"}
            adminEmail={currentUser?.email || "admin@sourceimpact.com"}
          />

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6">
            {renderDashboardContent()}
          </main>
        </div>

        {/* Mobile Navigation */}
        <MobileNav currentView={currentView} onNavigate={setCurrentView} />

        {/* Mobile Sidebar Drawer */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-64 p-0 bg-slate-900 text-white border-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SheetDescription className="sr-only">Mobile navigation menu</SheetDescription>
            <div className="h-full">
              <Sidebar
                currentView={currentView}
                onNavigate={(view) => {
                  setCurrentView(view as DashboardView);
                  setMobileMenuOpen(false);
                }}
                collapsed={false}
                onToggleCollapse={() => {}}
                mobile={true}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <Toaster />
    </AuthProvider>
  );
}
