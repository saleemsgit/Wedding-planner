"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, MapPin, BadgeCheck, ChevronLeft, Clock, Users, CheckCircle2, Loader2, Check } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

function lkr(n: number | null | undefined) {
  return n == null ? "Contact for pricing" : `LKR ${Number(n).toLocaleString()}`;
}

const FALLBACK = "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80";

export default function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, openAuth } = useAuth();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [activeImg, setActiveImg] = useState(0);
  const [packageId, setPackageId] = useState<string>("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [customRequests, setCustomRequests] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<any>(null);

  const returnTo = `/services/${id}`;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/services/${id}`, { cache: "no-store" });
        if (!res.ok) { if (active) setNotFound(true); return; }
        const d = await res.json();
        if (active) {
          setData(d);
          if (d.packages?.length) setPackageId(String(d.packages[0].id));
        }
      } catch {
        if (active) setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  const service = data?.service;
  const vendor = data?.vendor;
  const packages: any[] = data?.packages ?? [];

  const gallery: string[] = useMemo(() => {
    if (!service) return [];
    const imgs = Array.isArray(service.images) ? service.images.filter(Boolean) : [];
    const cover = service.coverImage || service.image;
    const ordered = cover ? [cover, ...imgs.filter((i: string) => i !== cover)] : imgs;
    return ordered.length ? ordered : [FALLBACK];
  }, [service]);

  const selectedPackage = packages.find((p) => String(p.id) === packageId) || null;
  const price = selectedPackage
    ? selectedPackage.discountedPrice ?? selectedPackage.price
    : service
    ? service.discountedPrice ?? service.basePrice
    : 0;

  const book = async () => {
    setError(null);
    if (!user) { openAuth("login", returnTo); return; }
    if (!eventDate) { setError("Please choose an event date."); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: Number(id),
          packageId: packageId ? Number(packageId) : null,
          eventDate, eventTime: eventTime || null, guestCount: guestCount || null, customRequests: customRequests || null,
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        if (res.status === 401) { openAuth("login", returnTo); setError("Please log in to book."); }
        else setError(d.error || "Could not create booking.");
        setSubmitting(false);
        return;
      }
      setConfirmed(d.booking);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) return <main className="mx-auto max-w-6xl px-6 py-10"><div className="h-96 animate-pulse rounded-3xl bg-gray-200" /></main>;
  if (notFound || !service) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-lg font-medium text-[#0f5b47]">Service not found</p>
        <Link href="/services" className="mt-3 inline-block text-[#cba85a] hover:underline">Back to services</Link>
      </main>
    );
  }

  if (confirmed) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100"><CheckCircle2 className="h-9 w-9 text-emerald-600" /></div>
        <h1 className="mt-5 font-serif text-3xl text-[#0f5b47]">Booking confirmed!</h1>
        <p className="mt-2 text-gray-600">Your booking for <strong>{service.title}</strong> is pending vendor confirmation.</p>
        <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-[#e8dcc8] bg-white p-5 text-left text-sm">
          <Row label="Booking #" value={`#${confirmed.id}`} />
          <Row label="Package" value={confirmed.packageName ?? "Base service"} />
          <Row label="Event date" value={new Date(confirmed.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} />
          <Row label="Amount" value={lkr(confirmed.amount)} />
          <Row label="Status" value={String(confirmed.status).toLowerCase()} />
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/myprofile" className="rounded-2xl bg-[#0f5b47] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0c4a3a]">View my bookings</Link>
          <Link href="/services" className="rounded-2xl border border-[#e8dcc8] px-6 py-3 text-sm font-medium text-[#0f5b47]">Browse more</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f6f1] pb-16">
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <Link href="/services" className="inline-flex items-center gap-1 text-sm text-[#0f5b47] hover:underline"><ChevronLeft className="h-4 w-4" /> Back to services</Link>

        {/* Gallery */}
        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_92px]">
          <div className="overflow-hidden rounded-3xl border border-[#e8dcc8] bg-white">
            <img src={gallery[activeImg] ?? FALLBACK} alt={service.title} className="h-72 w-full object-cover sm:h-[28rem]" />
          </div>
          {gallery.length > 1 ? (
            <div className="flex gap-3 overflow-x-auto lg:flex-col lg:overflow-y-auto">
              {gallery.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`h-20 w-24 shrink-0 overflow-hidden rounded-2xl border-2 transition lg:w-full ${activeImg === i ? "border-[#cba85a]" : "border-transparent opacity-80 hover:opacity-100"}`}>
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          {/* Info + packages */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-3xl text-[#0f5b47]">{service.title}</h1>
              {service.isFeatured ? <span className="rounded-full bg-[#cba85a] px-2.5 py-0.5 text-[11px] font-semibold text-white">Featured</span> : null}
              {service.category ? <span className="rounded-full bg-[#e8dcc8] px-3 py-1 text-xs font-medium text-[#0f5b47]">{service.category}</span> : null}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-[#cba85a] text-[#cba85a]" /> {Number(vendor.rating ?? 0).toFixed(1)} ({vendor.reviewCount ?? 0})</span>
              {vendor.location ? <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {vendor.location}</span> : null}
              {service.capacity ? <span className="flex items-center gap-1"><Users className="h-4 w-4" /> up to {service.capacity} guests</span> : null}
              {vendor.isVerified ? <span className="flex items-center gap-1 text-[#0f5b47]"><BadgeCheck className="h-4 w-4" /> Verified</span> : null}
            </div>

            <p className="mt-3 text-sm font-medium text-[#0f5b47]">Offered by {vendor.businessName}</p>
            {service.description ? <p className="mt-3 text-sm leading-6 text-gray-700">{service.description}</p> : null}
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-700">{service.longDescription || "A premium wedding service tailored for your celebration."}</p>

            {data.deal ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-800">🎁 {data.deal.title}</p>
                <p className="mt-1 text-sm text-amber-700">{data.deal.description} — save {data.deal.discount}%</p>
              </div>
            ) : null}

            {/* Packages */}
            {packages.length ? (
              <div className="mt-7">
                <h2 className="font-serif text-2xl text-[#0f5b47]">Choose a package</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {packages.map((p) => {
                    const selected = String(p.id) === packageId;
                    return (
                      <button key={p.id} type="button" onClick={() => setPackageId(String(p.id))} className={`rounded-3xl border p-5 text-left transition ${selected ? "border-[#0f5b47] bg-[#0f5b47]/[0.04] ring-2 ring-[#0f5b47]/20" : "border-[#e8dcc8] bg-white hover:border-[#cba85a]"}`}>
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-serif text-lg text-[#0f5b47]">{p.name}</p>
                          {selected ? <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0f5b47] text-white"><Check className="h-3.5 w-3.5" /></span> : null}
                        </div>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-[#cba85a]">{lkr(p.discountedPrice ?? p.price)}</span>
                          {p.discountedPrice ? <span className="text-sm text-gray-400 line-through">{lkr(p.price)}</span> : null}
                        </div>
                        {p.description ? <p className="mt-1 text-sm text-gray-600">{p.description}</p> : null}
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                          {p.guestCapacity ? <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {p.guestCapacity} guests</span> : null}
                          {p.duration ? <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {p.duration} hrs</span> : null}
                        </div>
                        {p.features?.length ? (
                          <ul className="mt-3 space-y-1.5">
                            {p.features.map((f: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-700"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0f5b47]" /> {f}</li>
                            ))}
                          </ul>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {data.reviews?.length ? (
              <div className="mt-7">
                <h2 className="font-serif text-2xl text-[#0f5b47]">Reviews</h2>
                <div className="mt-3 space-y-3">
                  {data.reviews.map((r: any) => (
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

          {/* Sticky booking panel */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-[#e8dcc8] bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">{selectedPackage ? `${selectedPackage.name} package` : "Starting at"}</p>
              <p className="text-3xl font-bold text-[#0f5b47]">{lkr(price)}</p>

              {!user ? (
                <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  <button onClick={() => openAuth("login", returnTo)} className="font-semibold underline">Log in</button> to complete your booking.
                </div>
              ) : null}

              <div className="mt-4 space-y-3">
                {packages.length ? (
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-[#0f5b47]">Package</span>
                    <select value={packageId} onChange={(e) => setPackageId(e.target.value)} className={inputCls}>
                      {packages.map((p) => <option key={p.id} value={p.id}>{p.name} — {lkr(p.discountedPrice ?? p.price)}</option>)}
                    </select>
                  </label>
                ) : null}
                <div className="grid grid-cols-2 gap-3">
                  <label className="block"><span className="mb-1 block text-xs font-medium text-[#0f5b47]">Date *</span><input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className={inputCls} /></label>
                  <label className="block"><span className="mb-1 block text-xs font-medium text-[#0f5b47]">Time</span><input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className={inputCls} /></label>
                </div>
                <label className="block"><span className="mb-1 block text-xs font-medium text-[#0f5b47]">Guest count</span><input type="number" value={guestCount} onChange={(e) => setGuestCount(e.target.value)} className={inputCls} placeholder="200" /></label>
                <label className="block"><span className="mb-1 block text-xs font-medium text-[#0f5b47]">Custom requests</span><textarea value={customRequests} onChange={(e) => setCustomRequests(e.target.value)} rows={2} className={inputCls} placeholder="Any special requirements…" /></label>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#e8dcc8] pt-3">
                <span className="text-sm font-medium text-[#0f5b47]">Total</span>
                <span className="text-xl font-bold text-[#0f5b47]">{lkr(price)}</span>
              </div>
              {error ? <p className="mt-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p> : null}
              <button onClick={book} disabled={submitting} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f5b47] py-3 text-sm font-semibold text-white transition hover:bg-[#0c4a3a] disabled:opacity-60">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {user ? "Confirm Booking" : "Book Now"}
              </button>
              <p className="mt-2 text-center text-xs text-gray-500">No payment now — the vendor confirms your booking.</p>
            </div>
          </aside>
        </div>

        {/* Similar */}
        {data.similar?.length ? (
          <div className="mt-10">
            <h2 className="font-serif text-2xl text-[#0f5b47]">Similar services</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.similar.map((s: any) => (
                <Link key={s.id} href={`/services/${s.id}`} className="overflow-hidden rounded-2xl border border-[#e8dcc8] bg-white transition hover:shadow-md">
                  <img src={s.coverImage || s.image || FALLBACK} alt={s.title} className="h-32 w-full object-cover" />
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

const inputCls = "w-full rounded-2xl border border-[#e8dcc8] bg-white px-3 py-2 text-sm text-[#0f5b47] outline-none focus:border-[#cba85a]";

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3 py-0.5"><span className="text-gray-500">{label}</span><span className="text-right font-medium text-[#0f5b47]">{value}</span></div>;
}
