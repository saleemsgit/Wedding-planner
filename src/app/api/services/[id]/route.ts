import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api-auth";
import { serializeService, serializeDeal } from "@/lib/serializers";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/services/[id] — public: full service detail + packages, vendor, reviews, similar services, active deal
export async function GET(request: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const service = await prisma.service.findFirst({
      where: { id: Number(id), isActive: true, vendor: { isActive: true } },
      include: {
        vendor: { include: { category: true } },
        category: true,
        packages: { where: { isActive: true }, orderBy: { price: "asc" } },
        reviews: { include: { customer: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 10 },
        deals: { where: { isActive: true } },
      },
    });

    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    const similar = await prisma.service.findMany({
      where: { isActive: true, categoryId: service.categoryId, id: { not: service.id }, vendor: { isActive: true } },
      include: { vendor: true, category: true },
      take: 4,
    });

    const reviews = service.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      customerName: r.customer?.name ?? "Customer",
      createdAt: r.createdAt,
    }));

    return NextResponse.json({
      service: serializeService(service),
      vendor: {
        id: service.vendor.id,
        businessName: service.vendor.businessName,
        location: service.vendor.location,
        phone: service.vendor.phone,
        email: service.vendor.email,
        rating: service.vendor.rating,
        reviewCount: service.vendor.reviewCount,
        isVerified: service.vendor.isVerified,
        description: service.vendor.description,
        category: service.vendor.category?.name ?? null,
      },
      packages: service.packages.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        discountedPrice: p.discountedPrice,
        features: p.features,
        guestCapacity: p.guestCapacity,
        duration: p.duration,
      })),
      reviews,
      deal: service.deals[0] ? serializeDeal(service.deals[0]) : null,
      similar: similar.map(serializeService),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
