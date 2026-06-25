import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api-auth";
import { serializeDeal } from "@/lib/serializers";

// GET /api/deals — public: only active, non-expired deals
export async function GET() {
  try {
    const deals = await prisma.deal.findMany({
      where: { isActive: true, endDate: { gte: new Date() } },
      orderBy: { createdAt: "desc" },
      include: { category: true, vendor: true },
    });
    return NextResponse.json({ deals: deals.map(serializeDeal) });
  } catch (error) {
    return errorResponse(error);
  }
}
