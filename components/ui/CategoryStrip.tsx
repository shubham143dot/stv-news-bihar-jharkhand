// components/ui/CategoryStrip.tsx
"use client";

import Link from "next/link";
import { NAV_LINKS } from "@/lib/utils/constants";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function CategoryStrip() {
  const { language, mounted } = useLanguage();

  return (
    <div className="flex items-center gap-0.5 overflow-x-auto py-1.5 scrollbar-hide">
      {NAV_LINKS.map((link) => {
        const label = mounted && language === "en" ? (link.labelEn ?? link.label) : link.label;
        return (
          <Link
            key={link.href}
            href={link.href}
            className="flex-shrink-0 px-6 py-2.5 text-sm font-black text-black hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-150 whitespace-nowrap"
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
