import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, errorResponse } from "@/lib/api-auth";

type Ctx = { params: Promise<{ id: string }> };

// PUT /api/me/gift-items/[id] — update an item the customer owns
export async function PUT(request: Request, { params }: Ctx) {
  try {
    const auth = requireRole(request, ["CUSTOMER"]);
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.giftExchangeItem.findFirst({ where: { id: Number(id), customerId: auth.id } });
    if (!existing) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    const item = await prisma.giftExchangeItem.update({
      where: { id: Number(id) },
      data: {
        itemName: body.itemName ?? undefined,
        category: body.category ?? undefined,
        quantity: body.quantity != null ? Number(body.quantity) : undefined,
        estimatedCost: body.estimatedCost === "" ? null : body.estimatedCost != null ? Number(body.estimatedCost) : undefined,
        status: body.status ?? undefined,
        deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : undefined,
        notes: body.notes ?? undefined,
      },
    });
    return NextResponse.json({ item });
  } catch (error) {
    return errorResponse(error);
  }
}

// DELETE /api/me/gift-items/[id]
export async function DELETE(request: Request, { params }: Ctx) {
  try {
    const auth = requireRole(request, ["CUSTOMER"]);
    const { id } = await params;
    const existing = await prisma.giftExchangeItem.findFirst({ where: { id: Number(id), customerId: auth.id } });
    if (!existing) return NextResponse.json({ error: "Item not found" }, { status: 404 });
    await prisma.giftExchangeItem.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: "Item deleted" });
  } catch (error) {
    return errorResponse(error);
  }
}
