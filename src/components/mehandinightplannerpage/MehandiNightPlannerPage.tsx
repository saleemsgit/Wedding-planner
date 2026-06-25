"use client";

import { useEffect, useState } from "react";
import { Flower2, Music, Palette, Users, UtensilsCrossed, Loader2, Save, CheckCircle2, Circle, Sparkles } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

const DECOR_THEMES = [
  { id: "royal-emerald", name: "Royal Emerald & Gold", desc: "Deep green drapes, gold accents, marigolds" },
  { id: "rustic-floral", name: "Rustic Floral", desc: "Earthy tones, fresh flowers, lanterns" },
  { id: "moroccan", name: "Moroccan Nights", desc: "Jewel tones, lanterns, low seating" },
  { id: "ivory-blush", name: "Ivory & Blush", desc: "Soft pastels, drapes, fairy lights" },
];

const MUSIC_OPTIONS = ["Live Dhol & Tabla", "DJ + Sound System", "Acoustic / Qawwali", "Curated Playlist"];

const FOOD_STALLS = ["Kottu Station", "Shawarma", "Falooda & Watalappam", "Biryani Counter", "Tea & Snacks", "Live Dosa", "Mocktail Bar"];

const DEFAULT_CHECKLIST = [
  { id: "book-artist", label: "Book mehndi artist", done: false },
  { id: "confirm-decor", label: "Confirm decor theme & vendor", done: false },
  { id: "music", label: "Arrange music / DJ", done: false },
  { id: "seating", label: "Plan seating arrangement", done: false },
  { id: "food", label: "Finalise food stalls", done: false },
  { id: "outfits", label: "Coordinate family outfits", done: false },
  { id: "favours", label: "Order guest favours", done: false },
];

type Selections = {
  decorTheme?: string;
  artist?: string;
  artistContact?: string;
  music?: string;
  seating?: string;
  foodStalls?: string[];
};

export default function MehndiNightPlanner() {
  const { isAuthenticated, openAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [eventDate, setEventDate] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [budget, setBudget] = useState("");
  const [sel, setSel] = useState<Selections>({ foodStalls: [] });
  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    (async () => {
      try {
        const res = await fetch("/api/me/mehndi-plan", { cache: "no-store" });
        if (res.ok) {
          const { mehndiPlan } = await res.json();
          if (mehndiPlan) {
            setEventDate(mehndiPlan.eventDate ? mehndiPlan.eventDate.slice(0, 10) : "");
            setGuestCount(mehndiPlan.guestCount != null ? String(mehndiPlan.guestCount) : "");
            setBudget(mehndiPlan.budget != null ? String(mehndiPlan.budget) : "");
            setSel({ foodStalls: [], ...(mehndiPlan.selections ?? {}) });
            if (Array.isArray(mehndiPlan.checklist) && mehndiPlan.checklist.length) setChecklist(mehndiPlan.checklist);
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated]);

  const toggleStall = (s: string) => {
    setSel((prev) => {
      const list = prev.foodStalls ?? [];
      return { ...prev, foodStalls: list.includes(s) ? list.filter((x) => x !== s) : [...list, s] };
    });
  };
  const toggleCheck = (id: string) => setChecklist((c) => c.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));

  const save = async () => {
    if (!isAuthenticated) { openAuth("login", "/mehndi-night"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/me/mehndi-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventDate: eventDate || null, guestCount, budget, selections: sel, checklist }),
      });
      if (res.ok) { setToast("Mehndi plan saved"); setTimeout(() => setToast(null), 2500); }
    } finally {
      setSaving(false);
    }
  };

  const completed = checklist.filter((c) => c.done).length;
  const progress = Math.round((completed / checklist.length) * 100);

  return (
    <main className="min-h-screen bg-[#f8f6f1] pb-16">
      <section className="bg-gradient-to-br from-[#0f5b47] via-[#11503f] to-[#1b6b52] text-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <p className="text-xs uppercase tracking-[0.28em] text-white/70">Mehndi Night</p>
          <h1 className="mt-2 font-serif text-3xl md:text-4xl">Plan your Mehndi celebration</h1>
          <p className="mt-2 max-w-2xl text-white/80">Choose your decor, artists, music, seating and food — and track your checklist all in one place.</p>
        </div>
      </section>

      {!isAuthenticated ? (
        <div className="mx-auto max-w-6xl px-6 pt-6">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            You can explore all options below. <button onClick={() => openAuth("login", "/mehndi-night")} className="font-semibold underline">Log in</button> to save your Mehndi plan.
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="mx-auto max-w-6xl px-6 py-8"><div className="h-96 animate-pulse rounded-3xl bg-gray-200" /></div>
      ) : (
        <div className="mx-auto max-w-6xl px-6 py-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            <Card icon={<Palette className="h-5 w-5" />} title="Decor theme">
              <div className="grid gap-3 sm:grid-cols-2">
                {DECOR_THEMES.map((t) => (
                  <button key={t.id} onClick={() => setSel({ ...sel, decorTheme: t.id })} className={`rounded-2xl border p-4 text-left transition ${sel.decorTheme === t.id ? "border-[#0f5b47] bg-[#0f5b47]/5" : "border-[#e8dcc8] bg-white hover:border-[#cba85a]"}`}>
                    <p className="text-sm font-semibold text-[#0f5b47]">{t.name}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{t.desc}</p>
                  </button>
                ))}
              </div>
            </Card>

            <Card icon={<Flower2 className="h-5 w-5" />} title="Mehndi artist">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Artist / studio name"><input value={sel.artist ?? ""} onChange={(e) => setSel({ ...sel, artist: e.target.value })} className={inputCls} placeholder="e.g. Zara Mehndi Designs" /></Field>
                <Field label="Contact"><input value={sel.artistContact ?? ""} onChange={(e) => setSel({ ...sel, artistContact: e.target.value })} className={inputCls} placeholder="Phone / email" /></Field>
              </div>
            </Card>

            <Card icon={<Music className="h-5 w-5" />} title="Music & entertainment">
              <div className="flex flex-wrap gap-2">
                {MUSIC_OPTIONS.map((m) => (
                  <button key={m} onClick={() => setSel({ ...sel, music: m })} className={`rounded-full px-4 py-2 text-sm font-medium transition ${sel.music === m ? "bg-[#0f5b47] text-white" : "border border-[#e8dcc8] bg-white text-[#0f5b47] hover:bg-[#fbf7ef]"}`}>{m}</button>
                ))}
              </div>
            </Card>

            <Card icon={<UtensilsCrossed className="h-5 w-5" />} title="Food stalls">
              <div className="flex flex-wrap gap-2">
                {FOOD_STALLS.map((f) => {
                  const on = (sel.foodStalls ?? []).includes(f);
                  return <button key={f} onClick={() => toggleStall(f)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${on ? "bg-[#cba85a] text-white" : "border border-[#e8dcc8] bg-white text-[#0f5b47] hover:bg-[#fbf7ef]"}`}>{on ? "✓ " : ""}{f}</button>;
                })}
              </div>
            </Card>

            <Card icon={<Users className="h-5 w-5" />} title="Seating arrangement">
              <textarea value={sel.seating ?? ""} onChange={(e) => setSel({ ...sel, seating: e.target.value })} rows={3} className={inputCls} placeholder="e.g. Low floor seating for 40, family sofa stage, ladies & gents separate sections…" />
            </Card>
          </div>

          <div className="space-y-6">
            <Card icon={<Sparkles className="h-5 w-5" />} title="Event details">
              <div className="space-y-3">
                <Field label="Mehndi date"><input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className={inputCls} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Guests"><input type="number" value={guestCount} onChange={(e) => setGuestCount(e.target.value)} className={inputCls} placeholder="100" /></Field>
                  <Field label="Budget (LKR)"><input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className={inputCls} placeholder="150000" /></Field>
                </div>
              </div>
            </Card>

            <Card icon={<CheckCircle2 className="h-5 w-5" />} title={`Checklist · ${progress}%`}>
              <div className="mb-3 h-2 overflow-hidden rounded-full bg-[#f0e6d6]"><div className="h-full rounded-full bg-gradient-to-r from-[#0f5b47] to-[#cba85a]" style={{ width: `${progress}%` }} /></div>
              <div className="space-y-1.5">
                {checklist.map((c) => (
                  <button key={c.id} onClick={() => toggleCheck(c.id)} className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-[#fbf7ef]">
                    {c.done ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Circle className="h-5 w-5 text-gray-300" />}
                    <span className={`text-sm ${c.done ? "text-gray-400 line-through" : "text-[#0f5b47]"}`}>{c.label}</span>
                  </button>
                ))}
              </div>
            </Card>

            <button onClick={save} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f5b47] py-3 text-sm font-semibold text-white hover:bg-[#0c4a3a] disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isAuthenticated ? "Save Mehndi plan" : "Log in to save"}
            </button>
          </div>
        </div>
      )}

      {toast ? <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#0f5b47] px-5 py-3 text-sm font-medium text-white shadow-lg">{toast}</div> : null}
    </main>
  );
}

const inputCls = "w-full rounded-2xl border border-[#e8dcc8] bg-white px-4 py-2.5 text-sm text-[#0f5b47] outline-none focus:border-[#cba85a]";

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-[#e8dcc8] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2"><span className="text-[#cba85a]">{icon}</span><h2 className="font-serif text-xl text-[#0f5b47]">{title}</h2></div>
      {children}
    </section>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-medium text-[#0f5b47]">{label}</span>{children}</label>;
}
