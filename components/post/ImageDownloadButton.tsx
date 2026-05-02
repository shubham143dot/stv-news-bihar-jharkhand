"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

interface ImageDownloadButtonProps {
  imageUrl: string;
  fileName: string;
}

export default function ImageDownloadButton({ imageUrl, fileName }: ImageDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName || "news-image"}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback: open in new tab if fetch fails (due to CORS)
      window.open(imageUrl, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="absolute top-4 right-4 bg-white/90 hover:bg-white dark:bg-black/80 dark:hover:bg-black p-2.5 rounded-full shadow-lg transition-all duration-200 group z-10 flex items-center gap-2"
      title="Download Image"
    >
      {isDownloading ? (
        <Loader2 className="w-5 h-5 animate-spin text-red-600" />
      ) : (
        <Download className="w-5 h-5 text-gray-700 dark:text-gray-200 group-hover:text-red-600 transition-colors" />
      )}
      <span className="text-xs font-bold pr-1 hidden sm:inline text-gray-700 dark:text-gray-200 group-hover:text-red-600">
        {isDownloading ? "Downloading..." : "Download Photo"}
      </span>
    </button>
  );
}
