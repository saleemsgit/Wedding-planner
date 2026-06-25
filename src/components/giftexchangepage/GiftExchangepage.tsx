"use client";

import { useEffect, useMemo, useState } from "react";
import { Gift, Plus, Trash2, Pencil, Loader2, Check, X, Sparkles } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

const GIFT_CATEGORIES = [
  "Clothes", "Jewelry", "Perfumes", "Cosmetics", "Shoes",
  "Sweets", "Fruits", "Watches", "Prayer Items", "Accessories",
];

const STATUSES = ["PENDING", "ORDERED", "RECEIVED"];

type Item = {
  id: number;
  itemName: string;
  category: string;
  quantity: number;
  estimatedCost: number | null;
  status: string;
  deliveryDate: string | null;
};

function lkr(n: number | null | undefined) {
  return n == null ? "—" : `LKR ${Number(n).toLocaleString()}`;
}

const empty = { itemName: "", category: GIFT_CATEGORIES[0], quantity: "1", estimatedCost: "", status: "PENDING", deliveryDate: "" };

export default function GiftExchangePlanner() {
  const { isAuthenticated, openAuth } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...empty });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    if (!isAuthenticated) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/me/gift-items", { cache: "no-store" });
      if (res.ok) setItems((await res.json()).items ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [isAuthenticated]);

  const resetForm = () => { setForm({ ...empty }); setEditingId(null); };

  const submit = async () => {
    if (!isAuthenticated) { openAuth("login", "/gift-exchange"); return; }
    if (!form.itemName.trim()) return;
    setBusy(true);
    try {
      const payload = {
        itemName: form.itemName,
        category: form.category,
        quantity: Number(form.quantity) || 1,
        estimatedCost: form.estimatedCost === "" ? null : Number(form.estimatedCost),
        status: form.status,
        deliveryDate: form.deliveryDate || null,
      };
      const res = await fetch(editingId ? `/api/me/gift-items/${editingId}` : "/api/me/gift-items", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) { resetForm(); await load(); }
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (it: Item) => {
    setEditingId(it.id);
    setForm({
      itemName: it.itemName,
      category: it.category,
      quantity: String(it.quantity),
      estimatedCost: it.estimatedCost != null ? String(it.estimatedCost) : "",
      status: it.status,
      deliveryDate: it.deliveryDate ? it.deliveryDate.slice(0, 10) : "",
    });
  };

  const remove = async (id: number) => {
    setBusy(true);
    try {
      await fetch(`/api/me/gift-items/${id}`, { method: "DELETE" });
      await load();
    } finally {
      setBusy(false);
    }
  };

  const cycleStatus = async (it: Item) => {
    const next = STATUSES[(STATUSES.indexOf(it.status) + 1) % STATUSES.length];
    await fetch(`/api/me/gift-items/${it.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
    load();
  };

  const filtered = useMemo(() => (filter === "all" ? items : items.filter((i) => i.category === filter)), [items, filter]);
  const totalCost = items.reduce((s, i) => s + (i.estimatedCost ?? 0) * (i.quantity || 1), 0);
  const received = items.filter((i) => i.status === "RECEIVED").length;

  return (
    <main className="min-h-screen bg-[#f8f6f1] pb-16">
      <section className="bg-gradient-to-br from-[#0f5b47] via-[#11503f] to-[#1b6b52] text-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <p className="text-xs uppercase tracking-[0.28em] text-white/70">Seer / Jahez</p>
          <h1 className="mt-2 font-serif text-3xl md:text-4xl">Gift Exchange Planner</h1>
          <p className="mt-2 max-w-2xl text-white/80">Plan and track every tray and gift for your Seer exchange — clothes, jewelry, perfumes, sweets and more.</p>
          {isAuthenticated ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <Stat label="Total items" value={String(items.length)} />
              <Stat label="Estimated cost" value={lkr(totalCost)} />
              <Stat label="Received" value={`${received}/${items.length}`} />
            </div>
          ) : null}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <section className="rounded-3xl border border-[#e8dcc8] bg-white p-5 shadow-sm lg:sticky lg:top-24 lg:self-start">
          <h2 className="font-serif text-xl text-[#0f5b47]">{editingId ? "Edit gift item" : "Add gift item"}</h2>
          {!isAuthenticated ? (
            <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <button onClick={() => openAuth("login", "/gift-exchange")} className="font-semibold underline">Log in</button> to save your gift list.
            </div>
          ) : null}
          <div className="mt-4 space-y-3">
            <Field label="Item name"><input value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} className={inputCls} placeholder="e.g. Bridal saree set" /></Field>
            <Field label="Category">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                {GIFT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Quantity"><input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className={inputCls} /></Field>
              <Field label="Est. cost (LKR)"><input type="number" value={form.estimatedCost} onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })} className={inputCls} placeholder="0" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Status">
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                </select>
              </Field>
              <Field label="Delivery date"><input type="date" value={form.deliveryDate} onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })} className={inputCls} /></Field>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={submit} disabled={busy} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0f5b47] py-2.5 text-sm font-semibold text-white hover:bg-[#0c4a3a] disabled:opacity-60">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editingId ? "Save changes" : "Add item"}
              </button>
              {editingId ? <button onClick={resetForm} className="rounded-2xl border border-[#e8dcc8] px-4 py-2.5 text-sm font-medium text-[#0f5b47]"><X className="h-4 w-4" /></button> : null}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex flex-wrap gap-2">
            <Chip active={filter === "all"} onClick={() => setFilter("all")}>All</Chip>
            {GIFT_CATEGORIES.map((c) => <Chip key={c} active={filter === c} onClick={() => setFilter(c)}>{c}</Chip>)}
          </div>

          {!isAuthenticated ? (
            <PublicPreview />
          ) : loading ? (
            <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-200" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#e8dcc8] bg-white px-6 py-16 text-center text-gray-500">
              <Gift className="mx-auto h-8 w-8 text-[#cba85a]" />
              <p className="mt-2 text-sm">No gift items yet. Add your first item to start your Seer list.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((it) => (
                <div key={it.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[#e8dcc8] bg-white p-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-[#0f5b47]">{it.itemName}</p>
                      <span className="rounded-full bg-[#e8dcc8] px-2 py-0.5 text-[10px] font-medium text-[#0f5b47]">{it.category}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Qty {it.quantity} · {lkr((it.estimatedCost ?? 0) * (it.quantity || 1))}{it.deliveryDate ? ` · by ${new Date(it.deliveryDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => cycleStatus(it)} className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${it.status === "RECEIVED" ? "bg-emerald-100 text-emerald-700" : it.status === "ORDERED" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`} title="Click to change status">
                      {it.status.toLowerCase()}
                    </button>
                    <button onClick={() => startEdit(it)} className="rounded-lg border border-[#e8dcc8] p-2 text-[#0f5b47] hover:bg-[#fbf7ef]"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => remove(it.id)} className="rounded-lg border border-[#e8dcc8] p-2 text-rose-600 hover:bg-rose-50"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

const inputCls = "w-full rounded-2xl border border-[#e8dcc8] bg-white px-4 py-2.5 text-sm text-[#0f5b47] outline-none focus:border-[#cba85a]";

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"><p className="text-xs uppercase tracking-wider text-white/70">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-medium text-[#0f5b47]">{label}</span>{children}</label>;
}
function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${active ? "bg-[#0f5b47] text-white" : "border border-[#e8dcc8] bg-white text-[#0f5b47] hover:bg-[#fbf7ef]"}`}>{children}</button>;
}
function PublicPreview() {
  return (
    <div className="rounded-3xl border border-[#e8dcc8] bg-white p-6">
      <div className="flex items-center gap-2 text-[#cba85a]"><Sparkles className="h-5 w-5" /><span className="text-sm font-semibold">Popular Seer gift categories</span></div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {GIFT_CATEGORIES.map((c) => (
          <div key={c} className="rounded-2xl border border-[#e8dcc8] bg-[#fbf7ef] px-4 py-3 text-center text-sm font-medium text-[#0f5b47]">{c}</div>
        ))}
      </div>
      <p className="mt-4 text-center text-sm text-gray-500">Log in to build and save your personalised gift list.</p>
    </div>
  );
}
