import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, errorResponse } from "@/lib/api-auth";
import { serializeBooking } from "@/lib/serializers";

// GET /api/me/profile — full customer profile bundle (user, bookings, wedding plan, notifications)
export async function GET(request: Request) {
  try {
    const auth = requireRole(request, ["CUSTOMER"]);

    const [user, bookings, weddingPlan, notifications, savedVendors] = await Promise.all([
      prisma.user.findUnique({
        where: { id: auth.id },
        select: { id: true, name: true, email: true, phone: true, profileImage: true, createdAt: true },
      }),
      prisma.booking.findMany({
        where: { customerId: auth.id },
        orderBy: { createdAt: "desc" },
        include: { vendor: true, service: true, package: true },
      }),
      prisma.weddingPlan.findUnique({ where: { customerId: auth.id } }),
      prisma.notification.findMany({ where: { userId: auth.id }, orderBy: { createdAt: "desc" }, take: 20 }),
      prisma.savedVendor.findMany({ where: { customerId: auth.id }, include: { vendor: true } }),
    ]);

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({
      user,
      bookings: bookings.map(serializeBooking),
      weddingPlan,
      notifications,
      savedVendors: savedVendors.map((s) => ({
        id: s.vendor.id,
        businessName: s.vendor.businessName,
        location: s.vendor.location,
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
