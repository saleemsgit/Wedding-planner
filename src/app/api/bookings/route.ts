import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, errorResponse } from "@/lib/api-auth";
import { serializeBooking } from "@/lib/serializers";

// POST /api/bookings — customer creates a booking (login required)
export async function POST(request: Request) {
  try {
    const auth = requireRole(request, ["CUSTOMER"]);
    const body = await request.json();
    const { serviceId, packageId, eventDate, eventTime, guestCount, customRequests } = body;

    if (!serviceId || !eventDate) {
      return NextResponse.json({ error: "Service and event date are required" }, { status: 400 });
    }

    const service = await prisma.service.findFirst({
      where: { id: Number(serviceId), isActive: true, vendor: { isActive: true } },
    });
    if (!service) return NextResponse.json({ error: "Service is not available" }, { status: 400 });

    let totalPrice = service.discountedPrice ?? service.basePrice;
    let resolvedPackageId: number | null = null;

    if (packageId) {
      const pkg = await prisma.package.findFirst({
        where: { id: Number(packageId), serviceId: service.id, isActive: true },
      });
      if (!pkg) return NextResponse.json({ error: "Selected package is not available" }, { status: 400 });
      totalPrice = pkg.discountedPrice ?? pkg.price;
      resolvedPackageId = pkg.id;
    }

    const eventDateObj = new Date(eventDate);
    if (Number.isNaN(eventDateObj.getTime())) {
      return NextResponse.json({ error: "Invalid event date" }, { status: 400 });
    }

    const booking = await prisma.booking.create({
      data: {
        customerId: auth.id,
        vendorId: service.vendorId,
        serviceId: service.id,
        packageId: resolvedPackageId,
        eventDate: eventDateObj,
        eventTime: eventTime || null,
        guestCount: guestCount != null && guestCount !== "" ? Number(guestCount) : null,
        customRequests: customRequests || null,
        totalPrice,
        finalPrice: totalPrice,
        status: "PENDING",
      },
      include: { customer: true, vendor: true, service: true, package: true },
    });

    // Best-effort notifications: one for the customer, one for every admin.
    try {
      const customerName = booking.customer?.name ?? "A customer";
      const pkgLabel = booking.package?.name ? ` (${booking.package.name})` : "";
      const admins = await prisma.user.findMany({ where: { role: "ADMIN", isActive: true }, select: { id: true } });
      await prisma.notification.createMany({
        data: [
          {
            userId: auth.id,
            title: "Booking received",
            message: `Your booking for ${service.title} is pending confirmation.`,
            type: "BOOKING_PENDING",
            relatedId: booking.id,
          },
          ...admins.map((a) => ({
            userId: a.id,
            title: "New booking",
            message: `${customerName} booked ${service.title}${pkgLabel} for ${eventDateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}.`,
            type: "BOOKING_PENDING" as const,
            relatedId: booking.id,
          })),
        ],
      });
    } catch (e) {
      console.error("notification failed", e);
    }

    return NextResponse.json({ booking: serializeBooking(booking) }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
