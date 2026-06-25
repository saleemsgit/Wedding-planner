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

    // Best-effort notification for the customer
    try {
      await prisma.notification.create({
        data: {
          userId: auth.id,
          title: "Booking received",
          message: `Your booking for ${service.title} is pending confirmation.`,
          type: "BOOKING_PENDING",
          relatedId: booking.id,
        },
      });
    } catch (e) {
      console.error("notification failed", e);
    }

    return NextResponse.json({ booking: serializeBooking(booking) }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
