// lib/utils/formatDate.ts
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("hi-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDateEn(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function timeAgo(dateString: string, lang: "hi" | "en" = "hi"): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (lang === "en") {
    if (diffSec < 60) return "just now";
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHr < 24) return `${diffHr} hr ago`;
    if (diffDay < 7) return `${diffDay} days ago`;
    return formatDateEn(dateString);
  }

  // Hindi (default)
  if (diffSec < 60) return "अभी";
  if (diffMin < 60) return `${diffMin} मिनट पहले`;
  if (diffHr < 24) return `${diffHr} घंटे पहले`;
  if (diffDay < 7) return `${diffDay} दिन पहले`;
  return formatDate(dateString);
}
