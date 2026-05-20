import Link from "next/link";
import { Mail } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";

export default function VerifyRequestPage() {
  return (
    <AuthCard title="Check your email">
      <div className="text-center py-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-indigo-600" />
          </div>
          <p className="text-gray-900 font-medium">
            We&apos;ve sent you a verification link
          </p>
          <p className="text-gray-500 text-sm max-w-xs">
            Please check your email inbox and click the link to verify your account.
          </p>
          <Link
            href="/auth/signin"
            className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}
