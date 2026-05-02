"use client";

import { useLanguage } from "@/lib/context/LanguageContext";
import { Globe } from "lucide-react";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="inline-flex p-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl">
      <button
        onClick={() => setLanguage("hi")}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
          language === "hi"
            ? "bg-white text-red-700 shadow-md font-bold scale-105"
            : "text-white/70 hover:text-white hover:bg-white/5"
        }`}
      >
        <span className="text-lg">🇮🇳</span>
        <span className="text-sm">हिन्दी</span>
      </button>
      <button
        onClick={() => setLanguage("en")}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
          language === "en"
            ? "bg-white text-red-700 shadow-md font-bold scale-105"
            : "text-white/70 hover:text-white hover:bg-white/5"
        }`}
      >
        <span className="text-lg">🇺🇸</span>
        <span className="text-sm">English</span>
      </button>
    </div>
  );
}
