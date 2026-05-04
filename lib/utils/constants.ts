// lib/utils/constants.ts
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "STV News Bihar Jharkhand";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://stvnews.in";
export const SITE_DESCRIPTION =
  "बिहार और झारखंड की सबसे तेज और विश्वसनीय खबरें। ताजा समाचार, राजनीति, मनोरंजन और खेल।";
export const POSTS_PER_PAGE = 12;
export const REVALIDATE_SECONDS = 60;

export const NAV_LINKS = [
  { label: "होम",      labelEn: "Home",          href: "/",                 key: "home" },
  { label: "बिहार",    labelEn: "Bihar",          href: "/tag/bihar",        key: "bihar" },
  { label: "झारखंड",  labelEn: "Jharkhand",       href: "/tag/jharkhand",    key: "jharkhand" },
  { label: "राजनीति", labelEn: "Politics",        href: "/tag/politics",     key: "politics" },
  { label: "मनोरंजन", labelEn: "Entertainment",   href: "/tag/entertainment", key: "entertainment" },
  { label: "खेल",     labelEn: "Sports",          href: "/tag/sports",       key: "sports" },
  { label: "क्राइम",  labelEn: "Crime",           href: "/tag/crime",        key: "crime" },
  { label: "व्यापार", labelEn: "Business",        href: "/tag/business",     key: "business" },
];

// Each entry: display label (language-specific) + slug (always English, matches NAV_LINKS)
export const POPULAR_TAGS_HI: { label: string; slug: string }[] = [
  { label: "बिहार",      slug: "bihar" },
  { label: "झारखंड",    slug: "jharkhand" },
  { label: "पटना",      slug: "patna" },
  { label: "रांची",     slug: "ranchi" },
  { label: "राजनीति",   slug: "politics" },
  { label: "क्राइम",    slug: "crime" },
  { label: "खेल",       slug: "sports" },
  { label: "मनोरंजन",   slug: "entertainment" },
  { label: "शिक्षा",    slug: "education" },
  { label: "स्वास्थ्य",  slug: "health" },
];

export const POPULAR_TAGS_EN: { label: string; slug: string }[] = [
  { label: "Bihar",         slug: "bihar" },
  { label: "Jharkhand",     slug: "jharkhand" },
  { label: "Patna",         slug: "patna" },
  { label: "Ranchi",        slug: "ranchi" },
  { label: "Politics",      slug: "politics" },
  { label: "Crime",         slug: "crime" },
  { label: "Sports",        slug: "sports" },
  { label: "Entertainment", slug: "entertainment" },
  { label: "Education",     slug: "education" },
  { label: "Health",        slug: "health" },
];

/** @deprecated Use POPULAR_TAGS_HI */
export const POPULAR_TAGS = POPULAR_TAGS_HI;
