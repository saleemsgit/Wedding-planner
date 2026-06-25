import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api-auth";
import { serializeVendor, serializeService } from "@/lib/serializers";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/vendors/[id] — public: active vendor + its active services
export async function GET(request: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const vendor = await prisma.vendor.findFirst({
      where: { id: Number(id), isActive: true },
      include: {
        category: true,
        services: { where: { isActive: true }, include: { packages: { where: { isActive: true } }, category: true, vendor: true } },
      },
    });
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    return NextResponse.json({
      vendor: serializeVendor(vendor),
      services: vendor.services.map(serializeService),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
