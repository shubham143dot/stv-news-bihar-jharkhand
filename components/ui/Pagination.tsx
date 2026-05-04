// components/ui/Pagination.tsx
"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import TranslatableText from "@/components/ui/TranslatableText";
import { useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath = "",
}: PaginationProps) {
  const searchParams = useSearchParams();

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  // Generate page numbers to show (window of 5 around current)
  const pages: (number | "...")[] = [];
  const delta = 2;
  const left = currentPage - delta;
  const right = currentPage + delta;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= left && i <= right)) {
      pages.push(i);
    } else if (i === left - 1 || i === right + 1) {
      pages.push("...");
    }
  }

  const pageLink = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    const query = params.toString();
    return query ? `${basePath}?${query}` : (basePath || "/");
  };

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1 mt-10 flex-wrap"
    >
      {/* Previous */}
      {hasPrev ? (
        <Link
          href={pageLink(currentPage - 1)}
          className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:border-red-400 hover:text-red-600 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <TranslatableText tKey="previous" />
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-full cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
          <TranslatableText tKey="previous" />
        </span>
      )}

      {/* Page numbers */}
      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">
            …
          </span>
        ) : (
          <Link
            key={page}
            href={pageLink(page as number)}
            className={clsx(
              "w-10 h-10 flex items-center justify-center text-sm font-semibold rounded-full transition-all",
              page === currentPage
                ? "bg-red-600 text-white shadow-lg shadow-red-200 dark:shadow-red-900/30"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-red-400 hover:text-red-600"
            )}
          >
            {page}
          </Link>
        )
      )}

      {/* Next */}
      {hasNext ? (
        <Link
          href={pageLink(currentPage + 1)}
          className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:border-red-400 hover:text-red-600 transition-all"
        >
          <TranslatableText tKey="next" />
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-full cursor-not-allowed">
          <TranslatableText tKey="next" />
          <ChevronRight className="w-4 h-4" />
        </span>
      )}
    </nav>
  );
}
