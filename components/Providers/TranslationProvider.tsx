"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function TranslationProvider({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();
  const pathname = usePathname();

  useEffect(() => {
    // 1. Load Google Translate Script if not present
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);

      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement({
          pageLanguage: 'hi',
          includedLanguages: 'hi,en',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
        }, 'google_translate_element');
      };
    }

    // 2. Trigger translation when language state changes OR path changes
    const triggerTranslate = () => {
      // If language is Hindi, try to clear translation (revert to original)
      if (language === 'hi') {
        const combo = document.querySelector(".goog-te-combo") as HTMLSelectElement;
        if (combo && combo.value !== 'hi') {
          combo.value = 'hi';
          combo.dispatchEvent(new Event("change"));
        }
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;
        return;
      }

      const combo = document.querySelector(".goog-te-combo") as HTMLSelectElement;
      if (combo) {
        combo.value = language;
        combo.dispatchEvent(new Event("change"));
      } else {
        // Fallback: Use cookie if widget not ready
        document.cookie = `googtrans=/hi/${language}; path=/`;
      }
    };

    // Wait a bit for the widget to be ready and DOM to be stable
    // We try a few times in case the widget is slow
    triggerTranslate();
    const timer = setTimeout(triggerTranslate, 1000);
    const timer2 = setTimeout(triggerTranslate, 3000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [language, pathname]);

  return (
    <>
      <div id="google_translate_element" style={{ display: 'none' }}></div>
      {children}
    </>
  );
}

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: any;
    setTranslateCookie: any;
  }
}
