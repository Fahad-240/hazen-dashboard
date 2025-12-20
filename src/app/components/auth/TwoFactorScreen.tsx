import { useState } from "react";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { Alert, AlertDescription } from "../ui/alert";

interface TwoFactorScreenProps {
  onVerify: (code: string) => void;
  onBack: () => void;
  onResend: () => void;
  isLoading?: boolean;
  error?: string;
  email?: string;
}

export function TwoFactorScreen({
  onVerify,
  onBack,
  onResend,
  isLoading,
  error,
  email,
}: TwoFactorScreenProps) {
  const [code, setCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleComplete = (value: string) => {
    setCode(value);
    if (value.length === 6) {
      onVerify(value);
    }
  };

  const handleResend = () => {
    onResend();
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
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
            <h1 className="text-slate-900 mb-1">Two-Factor Authentication</h1>
            <p className="text-slate-600 text-sm">
              Enter the 6-digit code sent to {email || "your registered email"}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {/* OTP Input */}
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={setCode}
                onComplete={handleComplete}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {/* Info Text */}
            <p className="text-center text-xs text-slate-500">
              This code will expire in 10 minutes
            </p>

            {/* Verify Button */}
            <Button
              onClick={() => handleComplete(code)}
              className="w-full h-11"
              disabled={isLoading || code.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </Button>

            {/* Resend Code */}
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">Didn't receive the code?</p>
              <Button
                onClick={handleResend}
                variant="link"
                className="text-sm"
                disabled={resendCooldown > 0 || isLoading}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
              </Button>
            </div>

            {/* Back Button */}
            <Button onClick={onBack} variant="ghost" className="w-full" disabled={isLoading}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          © 2024 Source Impact. All rights reserved.
        </p>
      </div>
    </div>
  );
}
