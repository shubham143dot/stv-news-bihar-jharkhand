// components/ui/Spinner.tsx
import clsx from "clsx";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <div
      className={clsx(
        "border-4 border-gray-200 dark:border-gray-700 border-t-red-600 rounded-full animate-spin",
        {
          "w-5 h-5 border-2": size === "sm",
          "w-8 h-8": size === "md",
          "w-12 h-12": size === "lg",
        },
        className
      )}
    />
  );
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Spinner size="lg" className="mx-auto mb-4" />
        <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
          लोड हो रहा है...
        </p>
      </div>
    </div>
  );
}
