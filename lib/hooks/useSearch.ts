// lib/hooks/useSearch.ts
"use client";
import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";

export function useSearch() {
  const searchParams = useSearchParams();
  // Initialize from the URL param so the input is pre-filled on the search page
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [isSearching, setIsSearching] = useState(false);

  const clearSearch = useCallback(() => {
    setQuery("");
  }, []);

  return {
    query,
    setQuery,
    isSearching,
    setIsSearching,
    clearSearch,
  };
}
