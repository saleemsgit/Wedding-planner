import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api-auth";
import { serializeVendor } from "@/lib/serializers";

// GET /api/vendors — public: only active vendors. Supports ?featured=true, ?category=slug, ?q=search
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const featured = url.searchParams.get("featured") === "true";
    const categorySlug = url.searchParams.get("category");
    const q = url.searchParams.get("q")?.trim();

    const vendors = await prisma.vendor.findMany({
      where: {
        isActive: true,
        ...(featured ? { isFeatured: true } : {}),
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
        ...(q
          ? {
              OR: [
                { businessName: { contains: q, mode: "insensitive" } },
                { location: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: [{ isFeatured: "desc" }, { rating: "desc" }],
      include: { category: true, services: true },
    });

    return NextResponse.json({ vendors: vendors.map(serializeVendor) });
  } catch (error) {
    return errorResponse(error);
  }
}
