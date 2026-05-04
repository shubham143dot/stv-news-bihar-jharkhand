// components/ui/TagPageHeader.tsx
"use client";

import { useLanguage } from "@/lib/context/LanguageContext";

interface TagPageHeaderProps {
  tag: string;
  count: number;
}

export default function TagPageHeader({ tag, count }: TagPageHeaderProps) {
  const { language, t, mounted } = useLanguage();

  if (!mounted) {
    return (
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-bold mb-3">
          #{tag}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
          &quot;{tag}&quot; से जुड़ी खबरें
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{count} खबरें मिलीं</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-bold mb-3">
        #{tag}
      </div>
      <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
        {language === "en"
          ? `News related to "${tag}"`
          : `"${tag}" से जुड़ी खबरें`}
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {count} {language === "en" ? t("newsFound") : "खबरें मिलीं"}
      </p>
    </div>
  );
}
