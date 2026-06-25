import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api-auth";
import { serializeService } from "@/lib/serializers";

// GET /api/services — public: only active services (of active vendors). Filters: ?category, ?q, ?location
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const categorySlug = url.searchParams.get("category");
    const q = url.searchParams.get("q")?.trim();
    const location = url.searchParams.get("location")?.trim();

    const services = await prisma.service.findMany({
      where: {
        isActive: true,
        vendor: { isActive: true, ...(location ? { location: { contains: location, mode: "insensitive" } } : {}) },
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { vendor: true, category: true, packages: { where: { isActive: true } } },
    });

    return NextResponse.json({ services: services.map(serializeService) });
  } catch (error) {
    return errorResponse(error);
  }
}
