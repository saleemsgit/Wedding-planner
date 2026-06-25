import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, errorResponse } from "@/lib/api-auth";

const STAGES = ["ENGAGEMENT", "GIFT_EXCHANGE", "MEHNDI", "NIKAH", "RECEPTION", "WALIMA"] as const;

// GET /api/me/wedding-plan — fetch (or lazily create) the customer's wedding plan
export async function GET(request: Request) {
  try {
    const auth = requireRole(request, ["CUSTOMER"]);
    let plan = await prisma.weddingPlan.findUnique({ where: { customerId: auth.id } });
    if (!plan) plan = await prisma.weddingPlan.create({ data: { customerId: auth.id } });

    // Derive spent amount from confirmed/completed bookings
    const spent = await prisma.booking.aggregate({
      where: { customerId: auth.id, status: { in: ["CONFIRMED", "COMPLETED"] } },
      _sum: { finalPrice: true },
    });

    return NextResponse.json({ weddingPlan: { ...plan, spentAmount: spent._sum.finalPrice ?? plan.spentAmount } });
  } catch (error) {
    return errorResponse(error);
  }
}

// POST /api/me/wedding-plan — upsert wedding plan details
export async function POST(request: Request) {
  try {
    const auth = requireRole(request, ["CUSTOMER"]);
    const body = await request.json();
    const stage = String(body.currentStage ?? "").toUpperCase();

    const data = {
      weddingDate: body.weddingDate ? new Date(body.weddingDate) : undefined,
      partnerName: body.partnerName ?? undefined,
      currentStage: (STAGES as readonly string[]).includes(stage) ? (stage as any) : undefined,
      totalBudget: body.totalBudget != null && body.totalBudget !== "" ? Number(body.totalBudget) : undefined,
      progressPercentage: body.progressPercentage != null ? Number(body.progressPercentage) : undefined,
    };

    const plan = await prisma.weddingPlan.upsert({
      where: { customerId: auth.id },
      update: data,
      create: { customerId: auth.id, ...data },
    });
    return NextResponse.json({ weddingPlan: plan });
  } catch (error) {
    return errorResponse(error);
  }
}
