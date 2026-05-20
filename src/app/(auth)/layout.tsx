export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-light via-background to-surface-secondary dark:from-surface dark:via-background dark:to-surface-secondary">
      <div className="w-full max-w-md px-4">
        {children}
      </div>
    </div>
  );
}
