"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

function lkr(n: number | null | undefined) {
  return n == null ? "—" : `LKR ${Number(n).toLocaleString()}`;
}

export default function BookingPage({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = use(params);
  const router = useRouter();
  const { user, openAuth } = useAuth();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [packageId, setPackageId] = useState<string>("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [customRequests, setCustomRequests] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<any>(null);

  const returnTo = `/booking/${serviceId}`;

  // Gate: require login
  useEffect(() => {
    if (!user) openAuth("login", returnTo);
  }, [user]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/services/${serviceId}`, { cache: "no-store" });
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
  }, [serviceId]);

  const service = data?.service;
  const packages: any[] = data?.packages ?? [];
  const selectedPackage = packages.find((p) => String(p.id) === packageId) || null;
  const price = selectedPackage ? selectedPackage.discountedPrice ?? selectedPackage.price : service ? service.discountedPrice ?? service.basePrice : 0;

  const submit = async () => {
    setError(null);
    if (!eventDate) { setError("Please select an event date."); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: Number(serviceId),
          packageId: packageId ? Number(packageId) : null,
          eventDate,
          eventTime: eventTime || null,
          guestCount: guestCount || null,
          customRequests: customRequests || null,
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        if (res.status === 401) { openAuth("login", returnTo); setError("Please log in to complete your booking."); }
        else setError(d.error || "Could not create booking.");
        setSubmitting(false);
        return;
      }
      setConfirmed(d.booking);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) return <main className="mx-auto max-w-3xl px-6 py-12"><div className="h-96 animate-pulse rounded-3xl bg-gray-200" /></main>;
  if (notFound || !service) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-lg font-medium text-[#0f5b47]">This service isn’t available for booking.</p>
        <Link href="/services" className="mt-3 inline-block text-[#cba85a] hover:underline">Browse services</Link>
      </main>
    );
  }

  if (confirmed) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-9 w-9 text-emerald-600" />
        </div>
        <h1 className="mt-5 font-serif text-3xl text-[#0f5b47]">Booking confirmed!</h1>
        <p className="mt-2 text-gray-600">Your booking for <strong>{service.title}</strong> is pending vendor confirmation.</p>
        <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-[#e8dcc8] bg-white p-5 text-left text-sm">
          <Row label="Booking #" value={`#${confirmed.id}`} />
          <Row label="Event date" value={new Date(confirmed.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} />
          {confirmed.packageName ? <Row label="Package" value={confirmed.packageName} /> : null}
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
      <div className="mx-auto max-w-4xl px-4 pt-6 sm:px-6">
        <Link href={`/services/${serviceId}`} className="inline-flex items-center gap-1 text-sm text-[#0f5b47] hover:underline"><ChevronLeft className="h-4 w-4" /> Back</Link>
        <h1 className="mt-3 font-serif text-3xl text-[#0f5b47]">Complete your booking</h1>
        <p className="mt-1 text-sm text-gray-600">{service.title} · {data.vendor?.businessName}</p>

        {!user ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
            Please <button onClick={() => openAuth("login", returnTo)} className="font-semibold underline">log in or sign up</button> to complete your booking.
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            {packages.length ? (
              <Section title="1. Select a package">
                <div className="space-y-2">
                  <label className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 ${packageId === "" ? "border-[#0f5b47] bg-[#0f5b47]/5" : "border-[#e8dcc8] bg-white"}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="pkg" checked={packageId === ""} onChange={() => setPackageId("")} className="accent-[#0f5b47]" />
                      <span className="text-sm font-medium text-[#0f5b47]">Base service</span>
                    </div>
                    <span className="text-sm font-bold text-[#cba85a]">{lkr(service.discountedPrice ?? service.basePrice)}</span>
                  </label>
                  {packages.map((p) => (
                    <label key={p.id} className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 ${packageId === String(p.id) ? "border-[#0f5b47] bg-[#0f5b47]/5" : "border-[#e8dcc8] bg-white"}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="pkg" checked={packageId === String(p.id)} onChange={() => setPackageId(String(p.id))} className="accent-[#0f5b47]" />
                        <div>
                          <span className="text-sm font-medium text-[#0f5b47]">{p.name}</span>
                          {p.guestCapacity ? <span className="ml-2 text-xs text-gray-500">up to {p.guestCapacity} guests</span> : null}
                        </div>
                      </div>
                      <span className="text-sm font-bold text-[#cba85a]">{lkr(p.discountedPrice ?? p.price)}</span>
                    </label>
                  ))}
                </div>
              </Section>
            ) : null}

            <Section title={`${packages.length ? "2" : "1"}. Event details`}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-[#0f5b47]">Event date *</span>
                  <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className={inputCls} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-[#0f5b47]">Event time</span>
                  <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className={inputCls} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-[#0f5b47]">Guest count</span>
                  <input type="number" min="0" value={guestCount} onChange={(e) => setGuestCount(e.target.value)} className={inputCls} placeholder="200" />
                </label>
              </div>
              <label className="mt-4 block">
                <span className="mb-1 block text-sm font-medium text-[#0f5b47]">Custom requests</span>
                <textarea value={customRequests} onChange={(e) => setCustomRequests(e.target.value)} rows={3} className={inputCls} placeholder="Any special requirements for your event…" />
              </label>
            </Section>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-[#e8dcc8] bg-white p-5 shadow-sm">
              <h3 className="font-serif text-lg text-[#0f5b47]">Payment summary</h3>
              <div className="mt-3 space-y-2 text-sm">
                <Row label="Service" value={service.title} />
                <Row label="Package" value={selectedPackage ? selectedPackage.name : "Base service"} />
                <Row label="Date" value={eventDate || "Not set"} />
                <div className="my-2 border-t border-[#e8dcc8]" />
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#0f5b47]">Total</span>
                  <span className="text-xl font-bold text-[#0f5b47]">{lkr(price)}</span>
                </div>
              </div>
              {error ? <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p> : null}
              <button onClick={submit} disabled={submitting || !user} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f5b47] py-3 text-sm font-semibold text-white transition hover:bg-[#0c4a3a] disabled:opacity-60">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Confirm Booking
              </button>
              <p className="mt-2 text-center text-xs text-gray-500">No payment required now. The vendor will confirm your booking.</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

const inputCls = "w-full rounded-2xl border border-[#e8dcc8] bg-white px-4 py-2.5 text-sm text-[#0f5b47] outline-none focus:border-[#cba85a]";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-[#e8dcc8] bg-white p-5">
      <h2 className="mb-4 font-serif text-lg text-[#0f5b47]">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-[#0f5b47]">{value}</span>
    </div>
  );
}
