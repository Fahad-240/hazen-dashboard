import { useState } from "react";
import { Eye, EyeOff, CircleAlert, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Alert, AlertDescription } from "../ui/alert";

interface LoginScreenProps {
  onLogin: (email: string, password: string) => void;
  onForgotPassword: () => void;
  isLoading?: boolean;
  error?: string;
}

export function LoginScreen({ onLogin, onForgotPassword, isLoading, error }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-8">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-900 rounded-lg mb-4">
              <span className="text-white font-bold text-xl">SI</span>
            </div>
            <h1 className="text-slate-900 mb-1">Source Impact</h1>
            <p className="text-slate-600 text-sm">Admin Portal</p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <CircleAlert className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email or Username</Label>
              <Input
                id="email"
                type="text"
                placeholder="admin@sourceimpact.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-11 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={isLoading}
                />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                  Remember me
                </Label>
              </div>
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm text-slate-900 hover:underline"
                disabled={isLoading}
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-slate-500 mt-6">
            Protected by enterprise-grade security. Unauthorized access is prohibited.
          </p>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs font-semibold text-slate-700 mb-2">Demo Credentials:</p>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div>
                <span className="font-medium">Super Admin:</span> superadmin@sourceimpact.com / superadmin123
              </div>
              <div>
                <span className="font-medium">Regular Admin:</span> admin@sourceimpact.com / admin123
              </div>
              <p className="text-xs text-slate-500 mt-2">2FA Code: 111111 (Super Admin) / 222222 (Regular Admin)</p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          © 2024 Source Impact. All rights reserved.
        </p>
      </div>
    </div>
  );
}