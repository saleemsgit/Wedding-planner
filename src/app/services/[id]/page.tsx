"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, MapPin, BadgeCheck, ChevronLeft, Clock, Users } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

function lkr(n: number | null | undefined) {
  return n == null ? "Contact for pricing" : `LKR ${Number(n).toLocaleString()}`;
}

export default function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { requireAuth } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const bookingHref = `/booking/${id}`;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/services/${id}`, { cache: "no-store" });
        if (!res.ok) { if (active) setNotFound(true); return; }
        const d = await res.json();
        if (active) setData(d);
      } catch {
        if (active) setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  const handleBook = () => {
    if (requireAuth(bookingHref)) router.push(bookingHref);
  };

  if (loading) {
    return <main className="mx-auto max-w-5xl px-6 py-10"><div className="h-80 animate-pulse rounded-3xl bg-gray-200" /></main>;
  }
  if (notFound || !data) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-lg font-medium text-[#0f5b47]">Service not found</p>
        <Link href="/services" className="mt-3 inline-block text-[#cba85a] hover:underline">Back to services</Link>
      </main>
    );
  }

  const { service, vendor, packages, reviews, deal, similar } = data;
  const img = service.image || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80";

  return (
    <main className="min-h-screen bg-[#f8f6f1] pb-16">
      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        <Link href="/services" className="inline-flex items-center gap-1 text-sm text-[#0f5b47] hover:underline"><ChevronLeft className="h-4 w-4" /> Back to services</Link>

        <div className="mt-4 overflow-hidden rounded-3xl">
          <img src={img} alt={service.title} className="h-72 w-full object-cover sm:h-96" />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-serif text-3xl text-[#0f5b47]">{service.title}</h1>
              {service.category ? <span className="rounded-full bg-[#e8dcc8] px-3 py-1 text-xs font-medium text-[#0f5b47]">{service.category}</span> : null}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-[#cba85a] text-[#cba85a]" /> {Number(vendor.rating ?? 0).toFixed(1)} ({vendor.reviewCount ?? 0})</span>
              {vendor.location ? <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {vendor.location}</span> : null}
              {vendor.isVerified ? <span className="flex items-center gap-1 text-[#0f5b47]"><BadgeCheck className="h-4 w-4" /> Verified</span> : null}
            </div>

            <p className="mt-4 text-sm leading-7 text-gray-700">{service.longDescription || service.description || "A premium wedding service tailored for your celebration."}</p>

            <div className="mt-4 rounded-2xl border border-[#e8dcc8] bg-white p-4">
              <p className="text-sm font-semibold text-[#0f5b47]">Offered by {vendor.businessName}</p>
              <p className="mt-1 text-sm text-gray-600">{vendor.description || "Trusted wedding vendor on WeddingSL."}</p>
            </div>

            {deal ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-800">🎁 {deal.title}</p>
                <p className="mt-1 text-sm text-amber-700">{deal.description} — save {deal.discount}%</p>
              </div>
            ) : null}

            {packages?.length ? (
              <div className="mt-6">
                <h2 className="font-serif text-xl text-[#0f5b47]">Packages</h2>
                <div className="mt-3 space-y-3">
                  {packages.map((p: any) => (
                    <div key={p.id} className="rounded-2xl border border-[#e8dcc8] bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-[#0f5b47]">{p.name}</p>
                          {p.description ? <p className="mt-0.5 text-sm text-gray-600">{p.description}</p> : null}
                        </div>
                        <p className="shrink-0 text-right font-bold text-[#cba85a]">{lkr(p.discountedPrice ?? p.price)}</p>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
                        {p.guestCapacity ? <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {p.guestCapacity} guests</span> : null}
                        {p.duration ? <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {p.duration} hrs</span> : null}
                      </div>
                      {p.features?.length ? (
                        <ul className="mt-2 flex flex-wrap gap-2">
                          {p.features.map((f: string, i: number) => <li key={i} className="rounded-full bg-[#f6f3ed] px-2.5 py-0.5 text-[11px] text-[#0f5b47]">{f}</li>)}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {reviews?.length ? (
              <div className="mt-6">
                <h2 className="font-serif text-xl text-[#0f5b47]">Reviews</h2>
                <div className="mt-3 space-y-3">
                  {reviews.map((r: any) => (
                    <div key={r.id} className="rounded-2xl border border-[#e8dcc8] bg-white p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#0f5b47]">{r.customerName}</span>
                        <span className="flex items-center gap-0.5 text-xs text-[#cba85a]">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-[#cba85a]" />)}</span>
                      </div>
                      {r.comment ? <p className="mt-1 text-sm text-gray-600">{r.comment}</p> : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Booking sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-[#e8dcc8] bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Starting at</p>
              <p className="text-3xl font-bold text-[#0f5b47]">{lkr(service.discountedPrice ?? service.basePrice)}</p>
              {service.discountedPrice ? <p className="text-sm text-gray-400 line-through">{lkr(service.basePrice)}</p> : null}
              <button onClick={handleBook} className="mt-4 w-full rounded-2xl bg-[#0f5b47] py-3 text-sm font-semibold text-white transition hover:bg-[#0c4a3a]">Book Now</button>
              <p className="mt-2 text-center text-xs text-gray-500">You’ll confirm date, guests & package next.</p>
            </div>
          </aside>
        </div>

        {similar?.length ? (
          <div className="mt-10">
            <h2 className="font-serif text-xl text-[#0f5b47]">Similar services</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((s: any) => (
                <Link key={s.id} href={`/services/${s.id}`} className="overflow-hidden rounded-2xl border border-[#e8dcc8] bg-white transition hover:shadow-md">
                  <img src={s.image || img} alt={s.title} className="h-32 w-full object-cover" />
                  <div className="p-3">
                    <p className="text-sm font-semibold text-[#0f5b47]">{s.title}</p>
                    <p className="text-xs text-gray-500">{s.vendorName}</p>
                    <p className="mt-1 text-sm font-bold text-[#cba85a]">{lkr(s.discountedPrice ?? s.basePrice)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
