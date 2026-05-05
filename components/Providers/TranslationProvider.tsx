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
      try {
        const combo = document.querySelector(".goog-te-combo") as HTMLSelectElement;
        
        if (language === 'hi') {
          if (combo && combo.value !== 'hi') {
            combo.value = 'hi';
            combo.dispatchEvent(new Event("change"));
          }
          // Clear cookies to ensure revert
          document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;
          return;
        }

        if (combo) {
          if (combo.value !== language) {
            combo.value = language;
            combo.dispatchEvent(new Event("change"));
          }
        } else {
          // Fallback: Use cookie if widget not ready
          document.cookie = `googtrans=/hi/${language}; path=/`;
        }
      } catch (err) {
        console.warn("Translation trigger failed:", err);
      }
    };

    // Use multiple timers to ensure the widget is ready
    const timers = [
      setTimeout(triggerTranslate, 500),
      setTimeout(triggerTranslate, 1500),
      setTimeout(triggerTranslate, 3000),
      setTimeout(triggerTranslate, 5000)
    ];
    
    return () => timers.forEach(clearTimeout);
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
