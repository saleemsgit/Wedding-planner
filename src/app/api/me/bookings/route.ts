import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, errorResponse } from "@/lib/api-auth";
import { serializeBooking } from "@/lib/serializers";

// GET /api/me/bookings — the logged-in customer's own bookings
export async function GET(request: Request) {
  try {
    const auth = requireRole(request, ["CUSTOMER"]);
    const bookings = await prisma.booking.findMany({
      where: { customerId: auth.id },
      orderBy: { createdAt: "desc" },
      include: { vendor: true, service: true, package: true },
    });
    return NextResponse.json({ bookings: bookings.map(serializeBooking) });
  } catch (error) {
    return errorResponse(error);
  }
}
