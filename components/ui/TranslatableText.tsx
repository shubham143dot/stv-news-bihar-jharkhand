"use client";

import { useLanguage } from "@/lib/context/LanguageContext";

interface TranslatableTextProps {
  tKey: string;
  className?: string;
  children?: React.ReactNode; // Optional default text
}

export default function TranslatableText({ tKey, className, children }: TranslatableTextProps) {
  const { t } = useLanguage();
  return <span className={className}>{t(tKey) || children}</span>;
}
