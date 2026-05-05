// components/ui/HeroLinks.tsx
"use client";

import Link from "next/link";
import { NAV_LINKS } from "@/lib/utils/constants";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function HeroLinks() {
  const { language, mounted, t } = useLanguage();

  return (
    <div className="flex flex-wrap gap-2">
      {NAV_LINKS.slice(1, 7).map((link) => {
        const label = mounted ? t(link.key) : link.label;
        return (
          <Link
            key={link.href}
            href={link.href}
            className="px-4 py-1.5 bg-white/20 hover:bg-white/30 border border-white/30 hover:border-white/50 text-white text-sm font-black rounded-full transition-all duration-200 backdrop-blur-md shadow-sm drop-shadow-sm"
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
