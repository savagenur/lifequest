import Link from "next/link";
import { Mail } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";

export default function VerifyRequestPage() {
  return (
    <AuthCard title="Check your email">
      <div className="text-center py-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <p className="text-text-primary font-medium">
            We&apos;ve sent you a verification link
          </p>
          <p className="text-text-muted text-sm max-w-xs">
            Please check your email inbox and click the link to verify your account.
          </p>
          <Link
            href="/auth/signin"
            className="mt-4 text-primary hover:text-primary-hover font-medium"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}
