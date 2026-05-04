// components/ui/CategoryStrip.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/utils/constants";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function CategoryStrip() {
  const { language, mounted } = useLanguage();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
      {NAV_LINKS.map((link) => {
        const label = mounted && language === "en" ? (link.labelEn ?? link.label) : link.label;
        const isActive = pathname === link.href;
        
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex-shrink-0 px-5 py-2 text-[15px] font-black transition-all duration-200 whitespace-nowrap rounded-full border-2 
              ${isActive 
                ? "bg-red-600 text-white border-red-600 shadow-md scale-105" 
                : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 hover:shadow-sm"
              }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
