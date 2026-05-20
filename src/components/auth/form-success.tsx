import { CheckCircle } from "lucide-react";

interface FormSuccessProps {
  message?: string;
}

export function FormSuccess({ message }: FormSuccessProps) {
  if (!message) return null;

  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-600 text-sm">
      <CheckCircle className="w-4 h-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
