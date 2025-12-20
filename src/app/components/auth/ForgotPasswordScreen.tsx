import { useState } from "react";
import { ArrowLeft, CircleCheck, Loader2, Mail } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";

interface ForgotPasswordScreenProps {
  onBack: () => void;
  onSubmit: (email: string) => void;
  isLoading?: boolean;
}

export function ForgotPasswordScreen({ onBack, onSubmit, isLoading }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email);
    setSubmitted(true);
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
            <h1 className="text-slate-900 mb-1">Reset Password</h1>
            <p className="text-slate-600 text-sm">
              Enter your email address and we'll send you instructions to reset your password
            </p>
          </div>

          {submitted ? (
            <div className="space-y-6">
              <Alert className="border-green-200 bg-green-50">
                <CircleCheck className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Password reset instructions have been sent to <strong>{email}</strong>
                </AlertDescription>
              </Alert>

              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-2">
                    Check your inbox and click the link in the email to reset your password.
                  </p>
                  <p className="text-xs text-slate-500">
                    Didn't receive the email? Check your spam folder or try again.
                  </p>
                </div>
              </div>

              <Button onClick={onBack} variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email Address</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="admin@sourceimpact.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-3">
                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Instructions"
                  )}
                </Button>

                <Button
                  type="button"
                  onClick={onBack}
                  variant="ghost"
                  className="w-full"
                  disabled={isLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </div>
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