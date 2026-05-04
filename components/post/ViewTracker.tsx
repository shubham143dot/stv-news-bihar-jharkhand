"use client";

import { useEffect } from "react";
import { incrementViews } from "@/lib/firebase/posts";

interface ViewTrackerProps {
  postId: string;
}

export default function ViewTracker({ postId }: ViewTrackerProps) {
  useEffect(() => {
    // Increment view count only once per page load
    const trackView = async () => {
      try {
        // We use a sessionStorage flag to avoid double-counting in the same session 
        // if they navigate back and forth quickly (optional but better)
        const storageKey = `viewed_${postId}`;
        if (!sessionStorage.getItem(storageKey)) {
          await incrementViews(postId);
          sessionStorage.setItem(storageKey, "true");
        }
      } catch (err) {
        console.error("Failed to increment views:", err);
      }
    };

    trackView();
  }, [postId]);

  return null; // This component doesn't render anything
}
