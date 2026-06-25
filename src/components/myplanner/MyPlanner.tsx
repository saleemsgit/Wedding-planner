"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock, Wallet, CheckCircle2, Circle, Loader2, Save,
  Gift, Flower2, Package, TrendingUp, Sparkles,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

const STAGES = [
  { key: "ENGAGEMENT", label: "Proposal & Engagement", icon: "💍" },
  { key: "GIFT_EXCHANGE", label: "Seer / Gift Exchange", icon: "🎁" },
  { key: "MEHNDI", label: "Mehndi Night", icon: "🌿" },
  { key: "NIKAH", label: "Nikah Ceremony", icon: "☪️" },
  { key: "RECEPTION", label: "Wedding Reception", icon: "🎊" },
  { key: "WALIMA", label: "Walima", icon: "🍽️" },
];

function lkr(n: number | null | undefined) {
  return n == null ? "LKR 0" : `LKR ${Number(n).toLocaleString()}`;
}

export default function MyPlannerPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [weddingDate, setWeddingDate] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [currentStage, setCurrentStage] = useState("ENGAGEMENT");

  const load = async () => {
    try {
      const [pRes, bRes] = await Promise.all([
        fetch("/api/me/wedding-plan", { cache: "no-store" }),
        fetch("/api/me/bookings", { cache: "no-store" }),
      ]);
      if (pRes.status === 401) { setUnauthorized(true); return; }
      const pData = await pRes.json();
      const bData = await bRes.json();
      const wp = pData.weddingPlan;
      setPlan(wp);
      setBookings(bData.bookings ?? []);
      setWeddingDate(wp?.weddingDate ? wp.weddingDate.slice(0, 10) : "");
      setPartnerName(wp?.partnerName ?? "");
      setTotalBudget(wp?.totalBudget != null ? String(wp.totalBudget) : "");
      setCurrentStage(wp?.currentStage ?? "ENGAGEMENT");
    } catch {
      setUnauthorized(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const stageIndex = STAGES.findIndex((s) => s.key === currentStage);
  const progress = Math.round(((stageIndex + 1) / STAGES.length) * 100);
  const spent = plan?.spentAmount ?? 0;
  const budgetNum = Number(totalBudget) || 0;
  const budgetPct = budgetNum > 0 ? Math.min(100, Math.round((spent / budgetNum) * 100)) : 0;
  const daysRemaining = useMemo(() => {
    if (!weddingDate) return null;
    const d = new Date(weddingDate).getTime();
    if (Number.isNaN(d)) return null;
    return Math.max(0, Math.ceil((d - Date.now()) / (1000 * 60 * 60 * 24)));
  }, [weddingDate]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/me/wedding-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weddingDate: weddingDate || null, partnerName, totalBudget, currentStage, progressPercentage: progress }),
      });
      if (res.ok) {
        const d = await res.json();
        setPlan((prev: any) => ({ ...prev, ...d.weddingPlan, spentAmount: prev?.spentAmount ?? 0 }));
        setToast("Wedding plan saved");
        setTimeout(() => setToast(null), 2500);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <main className="mx-auto max-w-6xl px-6 py-12"><div className="h-40 animate-pulse rounded-3xl bg-gray-200" /><div className="mt-6 h-64 animate-pulse rounded-2xl bg-gray-200" /></main>;
  }
  if (unauthorized || !isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#f8f6f1] px-6 py-24 text-center">
        <Sparkles className="mx-auto h-10 w-10 text-[#cba85a]" />
        <h1 className="mt-4 font-serif text-3xl text-[#0f5b47]">Your Wedding Planner</h1>
        <p className="mt-2 text-gray-600">Sign in to track your budget, timeline and booked services.</p>
        <button onClick={() => router.push("/login")} className="mt-5 rounded-2xl bg-[#0f5b47] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0c4a3a]">Sign in to continue</button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f6f1] pb-16">
      <section className="bg-gradient-to-br from-[#0f5b47] via-[#11503f] to-[#1b6b52] text-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <p className="text-xs uppercase tracking-[0.28em] text-white/70">My Wedding Planner</p>
          <h1 className="mt-2 font-serif text-3xl md:text-4xl">{partnerName ? `You & ${partnerName}` : "Your wedding journey"}</h1>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Stat icon={<Clock className="h-5 w-5" />} label="Days remaining" value={daysRemaining != null ? String(daysRemaining) : "—"} />
            <Stat icon={<TrendingUp className="h-5 w-5" />} label="Planning progress" value={`${progress}%`} />
            <Stat icon={<Wallet className="h-5 w-5" />} label="Budget used" value={`${budgetPct}%`} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Card title="Wedding timeline">
            <div className="space-y-2">
              {STAGES.map((s, i) => {
                const done = i < stageIndex;
                const active = i === stageIndex;
                return (
                  <div key={s.key} className={`flex items-center gap-3 rounded-2xl border p-3 ${active ? "border-[#0f5b47] bg-[#0f5b47]/5" : "border-[#e8dcc8] bg-white"}`}>
                    <span className="text-xl">{s.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#0f5b47]">{s.label}</p>
                      <p className="text-xs text-gray-500">{done ? "Completed" : active ? "In progress" : "Upcoming"}</p>
                    </div>
                    {done ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : active ? <Loader2 className="h-5 w-5 text-[#cba85a]" /> : <Circle className="h-5 w-5 text-gray-300" />}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="Booked services" action={{ label: "Book more", href: "/services" }}>
            {bookings.length === 0 ? (
              <Empty text="No services booked yet." cta={{ label: "Browse services", href: "/services" }} />
            ) : (
              <div className="divide-y divide-[#f0e6d6]">
                {bookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#cba85a]/15"><Package className="h-4 w-4 text-[#cba85a]" /></div>
                      <div>
                        <p className="text-sm font-medium text-[#0f5b47]">{b.serviceTitle ?? b.vendorName}</p>
                        <p className="text-xs text-gray-500">{b.eventDate ? new Date(b.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Date TBD"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#0f5b47]">{lkr(b.amount)}</p>
                      <StatusPill status={b.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <QuickLink href="/gift-exchange" icon={<Gift className="h-5 w-5" />} title="Gift Exchange" subtitle="Plan your Seer trays" />
            <QuickLink href="/mehndi-night" icon={<Flower2 className="h-5 w-5" />} title="Mehndi Night" subtitle="Decor, artists & more" />
          </div>
        </div>

        <div className="space-y-6">
          <Card title="Budget tracker">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-gray-500">Spent (confirmed)</p>
                <p className="text-2xl font-bold text-[#0f5b47]">{lkr(spent)}</p>
              </div>
              <p className="text-sm text-gray-500">of {lkr(budgetNum)}</p>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#f0e6d6]">
              <div className="h-full rounded-full bg-gradient-to-r from-[#0f5b47] to-[#cba85a]" style={{ width: `${budgetPct}%` }} />
            </div>
            <p className="mt-2 text-xs text-gray-500">{budgetNum > 0 ? `${lkr(Math.max(0, budgetNum - spent))} remaining` : "Set a budget below to track spending."}</p>
          </Card>

          <Card title="Plan details">
            <div className="space-y-4">
              <Field label="Partner's name"><input value={partnerName} onChange={(e) => setPartnerName(e.target.value)} className={inputCls} placeholder="e.g. Rizwan" /></Field>
              <Field label="Wedding date"><input type="date" value={weddingDate} onChange={(e) => setWeddingDate(e.target.value)} className={inputCls} /></Field>
              <Field label="Total budget (LKR)"><input type="number" value={totalBudget} onChange={(e) => setTotalBudget(e.target.value)} className={inputCls} placeholder="2500000" /></Field>
              <Field label="Current stage">
                <select value={currentStage} onChange={(e) => setCurrentStage(e.target.value)} className={inputCls}>
                  {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </Field>
              <button onClick={save} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f5b47] py-3 text-sm font-semibold text-white hover:bg-[#0c4a3a] disabled:opacity-60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save plan
              </button>
            </div>
          </Card>
        </div>
      </div>

      {toast ? <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#0f5b47] px-5 py-3 text-sm font-medium text-white shadow-lg">{toast}</div> : null}
    </main>
  );
}

const inputCls = "w-full rounded-2xl border border-[#e8dcc8] bg-white px-4 py-2.5 text-sm text-[#0f5b47] outline-none focus:border-[#cba85a]";

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-white/70">{icon}<span className="text-xs uppercase tracking-wider">{label}</span></div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
function Card({ title, action, children }: { title: string; action?: { label: string; href: string }; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-[#e8dcc8] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-xl text-[#0f5b47]">{title}</h2>
        {action ? <Link href={action.href as any} className="text-sm font-medium text-[#cba85a] hover:underline">{action.label}</Link> : null}
      </div>
      {children}
    </section>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-sm font-medium text-[#0f5b47]">{label}</span>{children}</label>;
}
function Empty({ text, cta }: { text: string; cta?: { label: string; href: string } }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#e8dcc8] bg-[#fbf7ef] px-4 py-8 text-center text-sm text-gray-500">
      {text}{cta ? <Link href={cta.href as any} className="mt-2 block font-medium text-[#cba85a] hover:underline">{cta.label}</Link> : null}
    </div>
  );
}
function StatusPill({ status }: { status: string }) {
  const tone: Record<string, string> = { PENDING: "bg-amber-100 text-amber-700", CONFIRMED: "bg-emerald-100 text-emerald-700", COMPLETED: "bg-blue-100 text-blue-700", REJECTED: "bg-rose-100 text-rose-700", CANCELLED: "bg-rose-100 text-rose-700" };
  return <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${tone[status] ?? "bg-gray-100 text-gray-700"}`}>{String(status).toLowerCase()}</span>;
}
function QuickLink({ href, icon, title, subtitle }: { href: string; icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <Link href={href as any} className="flex items-center gap-3 rounded-3xl border border-[#e8dcc8] bg-white p-4 transition hover:shadow-md">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0f5b47]/10 text-[#0f5b47]">{icon}</div>
      <div><p className="text-sm font-semibold text-[#0f5b47]">{title}</p><p className="text-xs text-gray-500">{subtitle}</p></div>
    </Link>
  );
}
