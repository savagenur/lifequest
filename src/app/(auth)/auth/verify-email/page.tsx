"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { verifyEmail } from "@/lib/auth-actions";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    async function verify() {
      if (!token) {
        setStatus("error");
        setMessage("Missing verification token");
        return;
      }

      const result = await verifyEmail(token);

      if (result.error) {
        setStatus("error");
        setMessage(result.error);
      } else if (result.success) {
        setStatus("success");
        setMessage(result.success);
      }
    }

    verify();
  }, [token]);

  return (
    <AuthCard title="Email Verification">
      <div className="text-center py-8">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-text-secondary">Verifying your email...</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <p className="text-text-primary font-medium">{message}</p>
            <Link
              href="/auth/signin"
              className="mt-4 px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition-colors"
            >
              Sign in
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-error-light rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-error" />
            </div>
            <p className="text-text-primary font-medium">{message}</p>
            <Link
              href="/auth/signin"
              className="mt-4 text-primary hover:text-primary-hover font-medium"
            >
              Back to sign in
            </Link>
          </div>
        )}
      </div>
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <AuthCard title="Email Verification">
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          </div>
        </AuthCard>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
