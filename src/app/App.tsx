import { useState } from "react";
import { LoginScreen } from "./components/auth/LoginScreen";
import { ForgotPasswordScreen } from "./components/auth/ForgotPasswordScreen";
import { ResetPasswordScreen } from "./components/auth/ResetPasswordScreen";
import { TwoFactorScreen } from "./components/auth/TwoFactorScreen";
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
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { User, MOCK_USERS } from "./types/auth";
import { AuthProvider } from "./context/AuthContext";

type AuthView = "login" | "forgot-password" | "reset-password" | "2fa";
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
  | "settings"
  | "security";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string>("");
  const [authView, setAuthView] = useState<AuthView>("login");
  const [currentView, setCurrentView] = useState<DashboardView>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Auth handlers
  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setAuthError("");
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Normalize email (trim and lowercase)
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();
    
    // Check against MOCK_USERS
    const userData = MOCK_USERS[normalizedEmail];
    if (userData && userData.password === normalizedPassword) {
      setPendingEmail(normalizedEmail);
      setAuthView("2fa");
      toast.success("Credentials verified! Please enter 2FA code.");
    } else {
      setAuthError("Invalid credentials. Please try again.");
    }
    
    setIsLoading(false);
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

  const handleTwoFactor = async (code: string) => {
    setIsLoading(true);
    setAuthError("");
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const userData = MOCK_USERS[pendingEmail];
    if (userData && userData.twoFactorCode === code) {
      setCurrentUser(userData.user);
      setIsAuthenticated(true);
      toast.success(`Welcome ${userData.user.name}!`);
    } else {
      setAuthError("Invalid verification code. Please try again.");
    }
    
    setIsLoading(false);
  };

  const handleResendCode = () => {
    toast.success("Verification code sent!");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setPendingEmail("");
    setAuthView("login");
    setCurrentView("dashboard");
    toast.success("Logged out successfully");
  };

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

    if (authView === "2fa") {
      return (
        <>
          <TwoFactorScreen
            onVerify={handleTwoFactor}
            onBack={() => {
              setAuthView("login");
              setPendingEmail("");
            }}
            onResend={handleResendCode}
            isLoading={isLoading}
            error={authError}
            email={pendingEmail}
          />
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
      case "settings":
        return <SettingsPanel />;
      case "security":
        return <SecurityPanel />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <AuthProvider user={currentUser}>
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
            onViewAllNotifications={() => setCurrentView("notifications")}
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
      </div>
      <Toaster />
    </AuthProvider>
  );
}
