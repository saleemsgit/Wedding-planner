import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, errorResponse } from "@/lib/api-auth";

// GET /api/me/gift-items — list the customer's gift exchange items
export async function GET(request: Request) {
  try {
    const auth = requireRole(request, ["CUSTOMER"]);
    const items = await prisma.giftExchangeItem.findMany({
      where: { customerId: auth.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ items });
  } catch (error) {
    return errorResponse(error);
  }
}

// POST /api/me/gift-items — add a gift item
export async function POST(request: Request) {
  try {
    const auth = requireRole(request, ["CUSTOMER"]);
    const body = await request.json();
    if (!body.itemName || !body.category) {
      return NextResponse.json({ error: "Item name and category are required" }, { status: 400 });
    }
    const item = await prisma.giftExchangeItem.create({
      data: {
        customerId: auth.id,
        itemName: body.itemName,
        category: body.category,
        quantity: body.quantity != null ? Number(body.quantity) : 1,
        estimatedCost: body.estimatedCost != null && body.estimatedCost !== "" ? Number(body.estimatedCost) : null,
        status: body.status || "PENDING",
        deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : null,
        notes: body.notes || null,
      },
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
