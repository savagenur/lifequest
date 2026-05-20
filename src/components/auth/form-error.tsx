import { AlertCircle } from "lucide-react";

interface FormErrorProps {
  message?: string;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-error-light text-error text-sm">
      <AlertCircle className="w-4 h-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
