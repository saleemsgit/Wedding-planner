import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, errorResponse } from "@/lib/api-auth";

// GET /api/me/mehndi-plan — fetch (or lazily create) the customer's mehndi plan
export async function GET(request: Request) {
  try {
    const auth = requireRole(request, ["CUSTOMER"]);
    let plan = await prisma.mehndiPlan.findUnique({ where: { customerId: auth.id } });
    if (!plan) plan = await prisma.mehndiPlan.create({ data: { customerId: auth.id } });
    return NextResponse.json({ mehndiPlan: plan });
  } catch (error) {
    return errorResponse(error);
  }
}

// POST /api/me/mehndi-plan — upsert mehndi plan
export async function POST(request: Request) {
  try {
    const auth = requireRole(request, ["CUSTOMER"]);
    const body = await request.json();

    const data = {
      eventDate: body.eventDate ? new Date(body.eventDate) : undefined,
      guestCount: body.guestCount != null && body.guestCount !== "" ? Number(body.guestCount) : undefined,
      budget: body.budget != null && body.budget !== "" ? Number(body.budget) : undefined,
      selections: body.selections ?? undefined,
      checklist: body.checklist ?? undefined,
    };

    const plan = await prisma.mehndiPlan.upsert({
      where: { customerId: auth.id },
      update: data,
      create: { customerId: auth.id, ...data },
    });
    return NextResponse.json({ mehndiPlan: plan });
  } catch (error) {
    return errorResponse(error);
  }
}
