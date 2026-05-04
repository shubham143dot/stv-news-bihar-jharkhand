// components/search/SearchBar.tsx
"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useSearch } from "@/lib/hooks/useSearch";
import clsx from "clsx";

interface SearchBarProps {
  autoFocus?: boolean;
  onClose?: () => void;
  className?: string;
}

export default function SearchBar({
  autoFocus = false,
  onClose,
  className,
}: SearchBarProps) {
  const { query, setQuery, clearSearch } = useSearch();
  const [isNavigating, setIsNavigating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsNavigating(true);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    onClose?.();
    // Reset spinner after navigation
    setTimeout(() => setIsNavigating(false), 1500);
  };

  const handleClear = () => {
    clearSearch();
    inputRef.current?.focus();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={clsx("relative flex items-center", className)}
    >
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit(e as unknown as React.FormEvent);
            }
          }}
          placeholder="खबर खोजें..."
          className="w-full pl-10 pr-10 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <button
        type="submit"
        disabled={isNavigating || !query.trim()}
        className="ml-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-full transition-colors flex-shrink-0"
      >
        {isNavigating ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          "खोजें"
        )}
      </button>
    </form>
  );
}
