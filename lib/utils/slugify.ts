// lib/utils/slugify.ts
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")       // spaces → dashes
    .replace(/[^\w\-]+/g, "")  // remove non-word chars
    .replace(/\-\-+/g, "-")    // collapse multiple dashes
    .replace(/^-+/, "")         // trim leading dashes
    .replace(/-+$/, "");        // trim trailing dashes
}

// Generate unique slug by appending timestamp if needed
export function generateSlug(title: string): string {
  const base = slugify(title);
  const timestamp = Date.now().toString(36);
  return `${base}-${timestamp}`;
}
