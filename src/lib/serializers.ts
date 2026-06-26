// Safe date helpers shared across API routes (fixes "toISOString is not a function").
export function toSafeIsoString(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}

type VendorWithCategory = {
  category?: { name: string; slug: string } | null;
  [key: string]: unknown;
};

/** Flatten a vendor row into the shape the UI/customer site expects. */
export function serializeVendor(vendor: Record<string, any>) {
  return {
    id: vendor.id,
    businessName: vendor.businessName,
    name: vendor.businessName,
    categoryId: vendor.categoryId,
    category: vendor.category?.name ?? null,
    categorySlug: vendor.category?.slug ?? null,
    description: vendor.description ?? null,
    email: vendor.email,
    phone: vendor.phone,
    location: vendor.location,
    address: vendor.address ?? null,
    image: vendor.baseImage ?? (Array.isArray(vendor.images) ? vendor.images[0] : null) ?? null,
    baseImage: vendor.baseImage ?? null,
    images: Array.isArray(vendor.images) ? vendor.images : [],
    rating: vendor.rating ?? 0,
    reviewCount: vendor.reviewCount ?? 0,
    isVerified: vendor.isVerified ?? false,
    verified: vendor.isVerified ?? false,
    isFeatured: vendor.isFeatured ?? false,
    featured: vendor.isFeatured ?? false,
    isActive: vendor.isActive ?? true,
    badge: vendor.badge ?? "AVAILABLE",
    minPrice: vendor.minPrice ?? null,
    maxPrice: vendor.maxPrice ?? null,
    startingPrice: vendor.minPrice ?? null,
    servicesCount: Array.isArray(vendor.services) ? vendor.services.length : undefined,
    createdAt: toSafeIsoString(vendor.createdAt),
  };
}

export function serializeService(service: Record<string, any>) {
  return {
    id: service.id,
    vendorId: service.vendorId,
    vendorName: service.vendor?.businessName ?? null,
    categoryId: service.categoryId,
    category: service.category?.name ?? null,
    title: service.title,
    slug: service.slug,
    description: service.description ?? null,
    longDescription: service.longDescription ?? null,
    images: Array.isArray(service.images) ? service.images : [],
    coverImage: service.coverImage ?? (Array.isArray(service.images) ? service.images[0] : null) ?? service.vendor?.baseImage ?? null,
    image: service.coverImage ?? (Array.isArray(service.images) ? service.images[0] : null) ?? service.vendor?.baseImage ?? null,
    basePrice: service.basePrice,
    discountedPrice: service.discountedPrice ?? null,
    discountPercentage: service.discountPercentage ?? null,
    capacity: service.capacity ?? null,
    isFeatured: service.isFeatured ?? false,
    isActive: service.isActive ?? true,
    duration: service.duration ?? null,
    rating: service.vendor?.rating ?? 0,
    reviewCount: service.vendor?.reviewCount ?? 0,
    location: service.vendor?.location ?? null,
    badge: service.vendor?.badge ?? "AVAILABLE",
    packages: Array.isArray(service.packages) ? service.packages.map(serializePackage) : undefined,
    createdAt: toSafeIsoString(service.createdAt),
  };
}

export function serializePackage(pkg: Record<string, any>) {
  return {
    id: pkg.id,
    serviceId: pkg.serviceId,
    vendorId: pkg.vendorId,
    name: pkg.name,
    description: pkg.description ?? null,
    price: pkg.price,
    discountedPrice: pkg.discountedPrice ?? null,
    features: Array.isArray(pkg.features) ? pkg.features : [],
    guestCapacity: pkg.guestCapacity ?? null,
    duration: pkg.duration ?? null,
    isActive: pkg.isActive ?? true,
  };
}

export function serializeDeal(deal: Record<string, any>) {
  return {
    id: deal.id,
    title: deal.title,
    description: deal.description ?? null,
    categoryId: deal.categoryId ?? null,
    category: deal.category?.name ?? null,
    vendorId: deal.vendorId ?? null,
    vendorName: deal.vendor?.businessName ?? null,
    serviceId: deal.serviceId ?? null,
    image: deal.image ?? (Array.isArray(deal.images) ? deal.images[0] : null) ?? null,
    images: Array.isArray(deal.images) ? deal.images : [],
    discountType: deal.discountType ?? "PERCENTAGE",
    discountValue: deal.discountValue ?? 0,
    originalPrice: deal.originalPrice ?? null,
    discountedPrice: deal.discountedPrice ?? null,
    discount: deal.discount ?? 0,
    startDate: toSafeIsoString(deal.startDate),
    endDate: toSafeIsoString(deal.endDate),
    validUntil: toSafeIsoString(deal.endDate),
    isActive: deal.isActive ?? true,
    createdAt: toSafeIsoString(deal.createdAt),
  };
}

export function serializeBooking(booking: Record<string, any>) {
  return {
    id: booking.id,
    customerId: booking.customerId,
    customerName: booking.customer?.name ?? null,
    customerEmail: booking.customer?.email ?? null,
    customerPhone: booking.customer?.phone ?? null,
    vendorId: booking.vendorId,
    vendorName: booking.vendor?.businessName ?? null,
    serviceId: booking.serviceId,
    serviceTitle: booking.service?.title ?? null,
    packageId: booking.packageId ?? null,
    packageName: booking.package?.name ?? null,
    eventDate: toSafeIsoString(booking.eventDate),
    eventTime: booking.eventTime ?? null,
    guestCount: booking.guestCount ?? null,
    customRequests: booking.customRequests ?? null,
    totalPrice: booking.totalPrice,
    finalPrice: booking.finalPrice,
    amount: booking.finalPrice ?? booking.totalPrice,
    status: booking.status,
    notes: booking.notes ?? null,
    createdAt: toSafeIsoString(booking.createdAt),
    bookingDate: toSafeIsoString(booking.createdAt),
  };
}
