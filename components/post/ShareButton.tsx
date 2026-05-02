"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import TranslatableText from "@/components/ui/TranslatableText";

interface ShareButtonProps {
  title: string;
  url: string;
}

export default function ShareButton({ title, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
          text: `${title} - STV News Bihar Jharkhand`,
        });
      } catch {
        // User cancelled or error — fall through to clipboard
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Clipboard copy failed");
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:text-blue-600 transition-all duration-200"
      aria-label="Share post"
    >
      {copied ? (
        <>
          <Check className="w-5 h-5 text-green-500" />
          <span className="text-green-600">Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="w-5 h-5" />
          <TranslatableText tKey="share">Share</TranslatableText>
        </>
      )}
    </button>
  );
}
