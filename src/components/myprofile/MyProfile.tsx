"use client";

import Link from 'next/link';
import {
  User, Calendar, Heart, Bell, Settings, LogOut, Clock,
  MapPin, Download, CreditCard, ChevronRight, BadgeCheck,
  Star, Phone, Mail, Edit2, Camera, TrendingUp, CheckCircle2,
  AlertCircle, Package
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

/* ─────────────────────────────────────────────────────────────────────────────
   Tiny helper components
───────────────────────────────────────────────────────────────────────────── */

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    confirmed: {
      label: 'Confirmed',
      cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
      icon: <CheckCircle2 className="w-3 h-3" />,
    },
    pending: {
      label: 'Pending',
      cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
      icon: <AlertCircle className="w-3 h-3" />,
    },
    paid: {
      label: 'Paid',
      cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
      icon: <CheckCircle2 className="w-3 h-3" />,
    },
  };
  const { label, cls, icon } = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}>
      {icon}
      {label}
    </span>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   Ornament SVG — thin geometric diamond row
───────────────────────────────────────────────────────────────────────────── */
const OrnamentDivider = () => (
  <div className="flex items-center gap-2 my-1">
    <div className="flex-1 h-px bg-linear-to-r from-transparent to-gold/30" />
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="7" y="1" width="8" height="8" rx="0.5" transform="rotate(45 7 1)" fill="#C9A84C" fillOpacity=".6" />
      <rect x="7" y="5" width="4" height="4" rx="0.5" transform="rotate(45 7 5)" fill="#C9A84C" />
    </svg>
    <div className="flex-1 h-px bg-linear-to-l from-transparent to-gold/30" />
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   Circular progress ring
───────────────────────────────────────────────────────────────────────────── */
const ProgressRing = ({ pct }: { pct: number }) => {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="5" />
      <circle
        cx="36" cy="36" r={r} fill="none" stroke="#C9A84C"
        strokeWidth="5" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      <text
        x="36" y="40" textAnchor="middle"
        className="rotate-90"
        style={{ rotate: '90deg', transformOrigin: '36px 36px' }}
        fill="#C9A84C" fontSize="13" fontWeight="600"
      >
        {pct}%
      </text>
    </svg>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────────────────────────── */
type ProfileData = {
  user: { id: number; name: string; email: string; phone: string | null; createdAt: string };
  bookings: any[];
  weddingPlan: any | null;
  notifications: any[];
  savedVendors: any[];
};

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'bookings' | 'payments' | 'saved' | 'timeline'>('bookings');
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/me/profile', { cache: 'no-store' });
        if (res.status === 401) { if (active) setUnauthorized(true); return; }
        const data = await res.json();
        if (active) setProfile(data);
      } catch {
        if (active) setUnauthorized(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const memberSince = profile?.user?.createdAt
    ? new Date(profile.user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';

  const userInfo = {
    name: profile?.user?.name ?? authUser?.name ?? 'Guest',
    partnerName: profile?.weddingPlan?.partnerName ?? '',
    email: profile?.user?.email ?? authUser?.email ?? '',
    phone: profile?.user?.phone ?? '',
    weddingDate: profile?.weddingPlan?.weddingDate ?? null,
    location: 'Sri Lanka',
    memberSince,
    planningProgress: profile?.weddingPlan?.progressPercentage ?? 0,
  };

  const bookingHistory = (profile?.bookings ?? []).map((b) => ({
    id: b.id,
    serviceId: b.serviceId,
    service: b.serviceTitle ?? b.vendorName ?? 'Service',
    category: b.vendorName ?? 'Vendor',
    date: b.eventDate,
    status: String(b.status ?? 'PENDING').toLowerCase(),
    amount: b.amount ?? b.finalPrice ?? 0,
    bookingDate: b.createdAt ?? b.bookingDate,
    packageName: b.packageName ?? 'Standard',
  }));

  const paymentHistory: { id: number; service: string; amount: number; type: string; date: string; method: string; status: string; invoice: string }[] = [];

  const savedVendors = (profile?.savedVendors ?? []).map((v) => ({
    id: v.id,
    name: v.businessName,
    category: v.location ?? 'Vendor',
    rating: 0,
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&q=80',
  }));

  const notifications = (profile?.notifications ?? []).map((n) => ({
    id: n.id,
    text: n.message ?? n.title,
    time: n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
    unread: !n.isRead,
    type: String(n.type ?? '').includes('CONFIRMED') ? 'success' : String(n.type ?? '').includes('REJECTED') ? 'warning' : 'info',
  }));

  const notifIcons: Record<string, string> = { success: '✅', message: '📸', warning: '⏰', info: '🌿' };

  const weddingTimeline = [
    { stage: 'Proposal', date: '2026-05-15', status: 'completed', icon: '💍', description: 'Completed successfully' },
    { stage: 'Gift Exchange (Seer)', date: '2026-06-20', status: 'in-progress', icon: '🎁', description: '65% planned' },
    { stage: 'Mehndi Night', date: '2026-07-10', status: 'pending', icon: '🌿', description: 'Venue: Home · Artists: TBD' },
    { stage: 'Groom Arrival', date: '2026-07-15', status: 'pending', icon: '👑', description: 'Car: Not booked' },
    { stage: 'Nikah Ceremony', date: '2026-07-15', status: 'pending', icon: '☪️', description: 'Imam: Booked ✅' },
    { stage: 'Wedding Reception', date: '2026-07-16', status: 'pending', icon: '🎊', description: 'Hall: Confirmed ✅' },
    { stage: 'Walima', date: '2026-07-17', status: 'pending', icon: '🍽️', description: 'Venue: Not set' },
  ];

  const totalSpent = bookingHistory
    .filter((b) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((s, b) => s + (b.amount ?? 0), 0);
  const daysRemaining = userInfo.weddingDate
    ? Math.max(0, Math.ceil((new Date(userInfo.weddingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const tabs = [
    { id: 'bookings', label: 'My Bookings', icon: <Package className="w-3.5 h-3.5" /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard className="w-3.5 h-3.5" /> },
    { id: 'saved', label: 'Saved Vendors', icon: <Heart className="w-3.5 h-3.5" /> },
    { id: 'timeline', label: 'Timeline', icon: <Calendar className="w-3.5 h-3.5" /> },
  ] as const;

  const categoryColors: Record<string, string> = {
    Venue: 'bg-violet-50 text-violet-700',
    Catering: 'bg-orange-50 text-orange-700',
    Photography: 'bg-sky-50 text-sky-700',
    'Gift Trays': 'bg-rose-50 text-rose-700',
    Religious: 'bg-emerald-50 text-emerald-700',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f6f1] px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="h-48 animate-pulse rounded-3xl bg-gray-200" />
          <div className="mt-6 h-64 animate-pulse rounded-2xl bg-gray-200" />
        </div>
      </div>
    );
  }

  if (unauthorized || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f8f6f1] px-6 py-24 text-center">
        <h1 className="font-serif text-3xl text-[#0f5b47]">Please sign in</h1>
        <p className="mt-2 text-gray-600">Log in to view your profile, bookings and wedding plan.</p>
        <button onClick={() => router.push('/login')} className="mt-5 rounded-2xl bg-[#0f5b47] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0c4a3a]">
          Go to login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory pb-24 md:pb-0" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Sans:wght@300;400;500&display=swap');
        .font-display { font-family: 'Cormorant Garamond', serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp .4s ease both; }
        .fade-up-1 { animation-delay: .05s; }
        .fade-up-2 { animation-delay: .1s; }
        .fade-up-3 { animation-delay: .15s; }

        .card-hover {
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.07);
        }
      `}</style>

      <div className="py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">

          {/* ── Hero Profile Banner ─────────────────────────────────────────── */}
          <div className="relative rounded-3xl overflow-hidden mb-8 fade-up">
            {/* layered background */}
            <div className="absolute inset-0 bg-linear-to-br from-[#1B3A2D] via-[#1f4733] to-[#2a5e46]" />
            {/* geometric dot pattern */}
            <div className="absolute inset-0 opacity-[0.06]"
              style={{ backgroundImage: 'repeating-conic-gradient(rgba(255,255,255,1) 0% 25%, transparent 0% 50%)', backgroundSize: '28px 28px' }}
            />
            {/* top shimmer line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-gold/60 to-transparent" />

            <div className="relative z-10 p-6 md:p-10">
              {/* top row */}
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">

                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-linear-to-br from-gold to-amber-600 flex items-center justify-center text-2xl md:text-3xl font-display font-semibold text-white shadow-xl">
                    {userInfo.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <button className="absolute -bottom-2 -right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                    <Camera className="w-3.5 h-3.5 text-green-deep" />
                  </button>
                  {/* verified ring */}
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gold rounded-full flex items-center justify-center">
                    <BadgeCheck className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                {/* Names & meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h1 className="font-display text-2xl md:text-4xl text-white font-light tracking-wide">
                      {userInfo.name}
                    </h1>
                    <span className="text-gold font-display text-2xl font-light">&amp;</span>
                    <h1 className="font-display text-2xl md:text-4xl text-white font-light tracking-wide">
                      {userInfo.partnerName}
                    </h1>
                  </div>
                  <OrnamentDivider />
                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-white/60 text-sm">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gold/70" />
                      Nikah: <span className="text-white/85 font-medium">July 15, 2026</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gold/70" />
                      {userInfo.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gold/70" />
                      <span className="text-gold font-semibold">{daysRemaining}</span> days remaining
                    </span>
                  </div>
                </div>

                {/* Progress ring */}
                <div className="shrink-0 bg-white/8 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/10">
                  <ProgressRing pct={userInfo.planningProgress} />
                  <p className="text-white/60 text-xs mt-1">Planning Done</p>
                </div>
              </div>

              {/* Stats strip */}
              <div className="grid grid-cols-4 gap-3 mt-6">
                {[
                  { label: 'Bookings', value: bookingHistory.length.toString(), icon: <Package className="w-4 h-4" /> },
                  { label: 'Total Spent', value: `LKR ${(totalSpent / 1000).toFixed(0)}K`, icon: <TrendingUp className="w-4 h-4" /> },
                  { label: 'Saved', value: savedVendors.length.toString(), icon: <Heart className="w-4 h-4" /> },
                  { label: 'Events', value: '7', icon: <Calendar className="w-4 h-4" /> },
                ].map((s) => (
                  <div key={s.label} className="bg-white/8 backdrop-blur-sm rounded-xl px-3 py-3 border border-white/10 hover:bg-white/12 transition-colors">
                    <div className="flex items-center gap-1.5 text-gold/70 mb-1">
                      {s.icon}
                      <span className="text-[10px] text-white/50 uppercase tracking-wider">{s.label}</span>
                    </div>
                    <div className="font-display text-xl md:text-2xl font-light text-gold">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Body ────────────────────────────────────────────────────────── */}
          <div className="grid lg:grid-cols-3 gap-6">

            {/* ── Main Content ─────────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-5 fade-up fade-up-1">

              {/* Tab bar */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar p-1 bg-card rounded-2xl border border-border">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-green-deep text-ivory shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-beige'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* ── Bookings ── */}
              {activeTab === 'bookings' && (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
                    <h2 className="font-display text-2xl text-green-deep font-medium">My Bookings</h2>
                    <Link href="/services/all" className="text-xs text-gold hover:text-green-deep transition-colors flex items-center gap-1 font-medium">
                      Book More <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="divide-y divide-border">
                    {bookingHistory.length === 0 ? (
                      <div className="px-6 py-12 text-center text-muted-foreground">
                        <p className="text-sm">You have no bookings yet.</p>
                        <Link href="/services" className="mt-2 inline-block text-xs font-medium text-gold hover:underline">Browse services to book</Link>
                      </div>
                    ) : null}
                    {bookingHistory.map((booking) => (
                      <div key={booking.id} className="px-6 py-4 hover:bg-beige/50 transition-colors group">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3 mb-2">
                              <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                                <Package className="w-4 h-4 text-gold" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-medium text-foreground truncate">{booking.service}</h3>
                                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                  <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${categoryColors[booking.category] ?? 'bg-gray-100 text-gray-700'}`}>
                                    {booking.category}
                                  </span>
                                  <span className="text-[11px] px-2 py-0.5 bg-beige text-muted-foreground rounded-md">
                                    {booking.packageName} Package
                                  </span>
                                  <StatusBadge status={booking.status} />
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-3 ml-11 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Booked {new Date(booking.bookingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 ml-11 sm:ml-0">
                            <div className="font-display text-xl font-medium text-gold">
                              LKR {booking.amount.toLocaleString()}
                            </div>
                            <Link
                              href={`/services/${booking.serviceId}`}
                              className="text-xs text-green-deep border border-border px-3 py-1.5 rounded-xl hover:bg-green-deep hover:text-ivory hover:border-green-deep transition-all"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Payments ── */}
              {activeTab === 'payments' && (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
                    <h2 className="font-display text-2xl text-green-deep font-medium">Payment History</h2>
                    <div className="text-sm text-muted-foreground bg-beige px-3 py-1.5 rounded-xl">
                      Total <span className="text-gold font-semibold">LKR {totalSpent.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="divide-y divide-border">
                    {paymentHistory.map((payment) => (
                      <div key={payment.id} className="px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-beige/50 transition-colors">
                        {/* receipt-style left accent */}
                        <div className={`w-1 self-stretch rounded-full shrink-0 ${payment.status === 'paid' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-medium text-sm text-foreground">{payment.service}</span>
                            <StatusBadge status={payment.status} />
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span>{payment.type}</span>
                            <span className="flex items-center gap-1">
                              <CreditCard className="w-3 h-3" />
                              {payment.method}
                            </span>
                            <span>{new Date(payment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span className="text-gold/60 font-mono">{payment.invoice}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-display text-xl font-medium text-gold">LKR {payment.amount.toLocaleString()}</div>
                          </div>
                          <button className="w-9 h-9 flex items-center justify-center bg-beige hover:bg-gold/10 border border-border hover:border-gold rounded-xl transition-all group/dl">
                            <Download className="w-4 h-4 text-muted-foreground group-hover/dl:text-gold transition-colors" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Saved Vendors ── */}
              {activeTab === 'saved' && (
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-display text-2xl text-green-deep font-medium">Saved Vendors</h2>
                    <span className="text-xs text-muted-foreground bg-beige px-3 py-1.5 rounded-xl">{savedVendors.length} saved</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {savedVendors.map((vendor) => (
                      <Link
                        key={vendor.id}
                        href={`/service/${vendor.id}`}
                        className="group relative rounded-2xl overflow-hidden aspect-4/3 card-hover"
                      >
                        <img
                          src={vendor.image}
                          alt={vendor.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        {/* gradient overlay */}
                        <div className="absolute inset-0 bg-linear-to-t from-[#0d2218] via-[#1B3A2D]/30 to-transparent" />
                        {/* top right heart */}
                        <button
                          onClick={(e) => { e.preventDefault(); }}
                          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                        >
                          <Heart className="w-4 h-4 text-gold fill-gold" />
                        </button>
                        {/* category pill */}
                        <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider bg-white/90 backdrop-blur-sm text-green-deep px-2.5 py-1 rounded-full">
                          {vendor.category}
                        </span>
                        {/* bottom info */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                            <span className="text-xs font-semibold text-gold">{vendor.rating}</span>
                          </div>
                          <div className="font-display text-white text-lg font-medium leading-tight">{vendor.name}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Timeline ── */}
              {activeTab === 'timeline' && (
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h2 className="font-display text-2xl text-green-deep font-medium mb-6">Wedding Timeline</h2>
                  <div className="relative">
                    {/* vertical track */}
                    <div className="absolute left-5 top-6 bottom-6 w-px bg-border" />
                    <div className="space-y-3">
                      {weddingTimeline.map((event, index) => (
                        <div key={index} className="flex gap-4 relative">
                          {/* node */}
                          <div className={`relative z-10 w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-lg border-2 shadow-sm ${
                            event.status === 'completed'
                              ? 'bg-gold/10 border-gold shadow-gold/20'
                              : event.status === 'in-progress'
                              ? 'bg-emerald-50 border-emerald-400'
                              : 'bg-card border-border'
                          }`}>
                            {event.icon}
                          </div>
                          {/* card */}
                          <div className={`flex-1 mb-1 p-4 rounded-xl border transition-colors ${
                            event.status === 'completed'
                              ? 'bg-gold/5 border-gold/20'
                              : event.status === 'in-progress'
                              ? 'bg-emerald-50 border-emerald-200'
                              : 'bg-beige/60 border-border hover:bg-beige'
                          }`}>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="font-medium text-green-deep text-sm">{event.stage}</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                              </div>
                              <span className={`shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full ${
                                event.status === 'completed' ? 'bg-gold/15 text-gold' :
                                event.status === 'in-progress' ? 'bg-emerald-100 text-emerald-700' :
                                'bg-white text-muted-foreground border border-border'
                              }`}>
                                {event.status === 'completed' ? 'Done' : event.status === 'in-progress' ? 'In Progress' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Sidebar ──────────────────────────────────────────────────── */}
            <div className="space-y-5 fade-up fade-up-2">

              {/* Personal Info */}
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border">
                  <h2 className="font-display text-lg text-green-deep font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-gold" />
                    Personal Info
                  </h2>
                  <button className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-beige transition-colors">
                    <Edit2 className="w-3.5 h-3.5 text-gold" />
                  </button>
                </div>
                <div className="p-4 space-y-2">
                  {[
                    { icon: <Mail className="w-3.5 h-3.5" />, label: 'Email', value: userInfo.email },
                    { icon: <Phone className="w-3.5 h-3.5" />, label: 'Phone', value: userInfo.phone },
                    { icon: <Calendar className="w-3.5 h-3.5" />, label: 'Wedding Date', value: 'July 15, 2026' },
                    { icon: <MapPin className="w-3.5 h-3.5" />, label: 'Location', value: userInfo.location },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 p-3 bg-beige rounded-xl hover:bg-gold/5 transition-colors">
                      <span className="text-gold/70 shrink-0">{item.icon}</span>
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
                        <p className="text-sm text-foreground truncate">{item.value}</p>
                      </div>
                    </div>
                  ))}
                  <button className="w-full mt-1 py-2.5 rounded-xl border border-border text-sm text-foreground hover:bg-beige hover:border-gold transition-all">
                    Edit Profile
                  </button>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border">
                  <h2 className="font-display text-lg text-green-deep font-medium flex items-center gap-2">
                    <Bell className="w-4 h-4 text-gold" />
                    Notifications
                  </h2>
                  {notifications.filter(n => n.unread).length > 0 && (
                    <span className="w-5 h-5 bg-gold rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {notifications.filter(n => n.unread).length}
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl text-sm transition-colors cursor-pointer ${
                        n.unread
                          ? 'bg-gold/8 border border-gold/20 hover:bg-gold/12'
                          : 'bg-beige hover:bg-beige/80'
                      }`}
                    >
                      <div className="flex gap-2">
                        <span className="text-base shrink-0">{notifIcons[n.type]}</span>
                        <div>
                          <p className="text-foreground text-xs leading-snug">{n.text}</p>
                          <p className="text-muted-foreground text-[11px] mt-1">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button className="w-full py-2 text-xs text-gold hover:text-green-deep transition-colors font-medium">
                    View All Notifications →
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="px-5 pt-5 pb-3 border-b border-border">
                  <h2 className="font-display text-lg text-green-deep font-medium">Quick Actions</h2>
                </div>
                <div className="p-4 space-y-1.5">
                  {[
                    { icon: <Calendar className="w-4 h-4" />, name: 'My Planner', path: '/planner', color: 'text-gold' },
                    { icon: <Heart className="w-4 h-4" />, name: 'Browse Services', path: '/services/all', color: 'text-gold' },
                    { icon: <Settings className="w-4 h-4" />, name: 'Account Settings', path: '/settings', color: 'text-muted-foreground' },
                  ].map((action, index) => (
                    <Link
                      key={index}
                      href={action.path}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-beige transition-colors group"
                    >
                      <span className={`${action.color} group-hover:scale-110 transition-transform`}>{action.icon}</span>
                      <span className="text-sm text-foreground flex-1">{action.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-gold transition-colors" />
                    </Link>
                  ))}
                  <div className="h-px bg-border my-1" />
                  <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors w-full text-left group">
                    <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-500 transition-colors" />
                    <span className="text-sm text-red-400 group-hover:text-red-500 transition-colors">Sign Out</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 