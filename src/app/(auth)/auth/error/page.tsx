"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "Access denied. You do not have permission to sign in.",
    Verification: "The verification link has expired or is invalid.",
    Default: "An error occurred during authentication.",
  };

  const message = errorMessages[error || ""] || errorMessages.Default;

  return (
    <AuthCard title="Authentication Error">
      <div className="text-center py-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-gray-900 font-medium">{message}</p>
          <Link
            href="/auth/signin"
            className="mt-4 px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <AuthCard title="Authentication Error">
          <div className="text-center py-8">
            <p className="text-gray-500">Loading...</p>
          </div>
        </AuthCard>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
