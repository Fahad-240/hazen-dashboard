import { useState, type FormEvent } from "react";
import { Eye, EyeOff, CircleCheck, Loader2, Check, X, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { Progress } from "../ui/progress";

interface ResetPasswordScreenProps {
  onSubmit: (password: string) => void;
  isLoading?: boolean;
}

export function ResetPasswordScreen({ onSubmit, isLoading }: ResetPasswordScreenProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const passwordStrength = calculatePasswordStrength(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const isValid = passwordStrength.score >= 3 && passwordsMatch;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onSubmit(password);
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-900 rounded-lg mb-4">
              <span className="text-white font-bold text-xl">SI</span>
            </div>
            <h1 className="text-slate-900 mb-1">Create New Password</h1>
            <p className="text-slate-600 text-sm">
              Choose a strong password for your admin account
            </p>
          </div>

          {submitted ? (
            <div className="space-y-6 text-center">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Your password has been successfully reset
                </AlertDescription>
              </Alert>

              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>

              <div>
                <p className="text-sm text-slate-600 mb-4">
                  You can now sign in with your new password
                </p>
                <Button onClick={() => window.location.reload()} className="w-full">
                  Continue to Login
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
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

              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Password strength</span>
                    <span className={`font-medium ${passwordStrength.color}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <Progress value={passwordStrength.score * 25} className="h-2" />
                  <div className="space-y-1 pt-2">
                    <PasswordRequirement met={passwordStrength.criteria.length} text="At least 8 characters" />
                    <PasswordRequirement met={passwordStrength.criteria.uppercase} text="One uppercase letter" />
                    <PasswordRequirement met={passwordStrength.criteria.lowercase} text="One lowercase letter" />
                    <PasswordRequirement met={passwordStrength.criteria.number} text="One number" />
                    <PasswordRequirement met={passwordStrength.criteria.special} text="One special character" />
                  </div>
                </div>
              )}

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-11 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-red-600">Passwords do not match</p>
                )}
              </div>

              <Button type="submit" className="w-full h-11" disabled={isLoading || !isValid}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          © 2024 Source Impact. All rights reserved.
        </p>
      </div>
    </div>
  );
}

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {met ? (
        <Check className="h-3 w-3 text-green-600" />
      ) : (
        <X className="h-3 w-3 text-slate-300" />
      )}
      <span className={met ? "text-green-600" : "text-slate-500"}>{text}</span>
    </div>
  );
}

function calculatePasswordStrength(password: string) {
  const criteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const score = Object.values(criteria).filter(Boolean).length;

  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const colors = [
    "text-red-600",
    "text-orange-600",
    "text-yellow-600",
    "text-blue-600",
    "text-green-600",
  ];

  return {
    score,
    criteria,
    label: labels[score] || labels[0],
    color: colors[score] || colors[0],
  };
}