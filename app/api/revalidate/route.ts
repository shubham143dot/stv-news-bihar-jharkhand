// app/api/revalidate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const slug   = request.nextUrl.searchParams.get("slug");
  const tag    = request.nextUrl.searchParams.get("tag");

  // Accept both secret formats (server-only and public)
  const validSecret =
    process.env.REVALIDATE_SECRET ||
    process.env.NEXT_PUBLIC_REVALIDATE_SECRET;

  if (!secret || secret !== validSecret) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  try {
    // Always revalidate homepage
    revalidatePath("/");

    // Revalidate specific post page
    if (slug) {
      revalidatePath(`/post/${slug}`);
    }

    // Revalidate tag page
    if (tag) {
      revalidatePath(`/tag/${tag}`);
    }

    return NextResponse.json({ revalidated: true, now: Date.now(), slug, tag });
  } catch (err) {
    console.error("Revalidation failed:", err);
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 });
  }
}
