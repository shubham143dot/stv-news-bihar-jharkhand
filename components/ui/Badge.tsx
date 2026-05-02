// components/ui/Badge.tsx
import Link from "next/link";
import clsx from "clsx";

interface BadgeProps {
  label: string;
  href?: string;
  variant?: "default" | "red" | "dark";
  className?: string;
}

export default function Badge({
  label,
  href,
  variant = "default",
  className,
}: BadgeProps) {
  const classes = clsx(
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors",
    {
      "bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50":
        variant === "red",
      "bg-gray-100 dark:bg-gray-800 text-black dark:text-gray-100 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-900 dark:hover:text-red-300":
        variant === "default",
      "bg-gray-800 text-gray-100 hover:bg-gray-900": variant === "dark",
    },
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        #{label}
      </Link>
    );
  }

  return <span className={classes}>#{label}</span>;
}
