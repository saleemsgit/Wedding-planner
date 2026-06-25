"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

interface ServiceItem {
  id: number;
  title: string;
  vendorName: string | null;
  category: string | null;
  categorySlug?: string | null;
  location: string | null;
  rating: number;
  reviewCount: number;
  basePrice: number;
  discountedPrice: number | null;
  badge: string;
  image: string | null;
}

const badgeConfig: Record<string, string> = {
  AVAILABLE: "bg-green-600 text-white",
  LIMITED: "bg-amber-700 text-white",
  BOOKED: "bg-red-600 text-white",
};

const FALLBACK_IMG = "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&q=80";

function lkr(n: number | null | undefined) {
  return n == null ? "Contact for pricing" : `LKR ${Number(n).toLocaleString()}`;
}

function ServiceCard({ service }: { service: ServiceItem }) {
  const { requireAuth } = useAuth();
  const router = useRouter();
  const bookingHref = `/booking/${service.id}`;

  const handleBook = () => {
    if (requireAuth(bookingHref)) {
      router.push(bookingHref);
    }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col">
      <Link href={`/services/${service.id}`} className="relative block h-44 overflow-hidden">
        <img src={service.image || FALLBACK_IMG} alt={service.title} className="w-full h-full object-cover" />
        <span className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded ${badgeConfig[String(service.badge).toUpperCase()] ?? "bg-green-600 text-white"}`}>
          {String(service.badge).toLowerCase()}
        </span>
      </Link>

      <div className="p-3 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="#cba85a"><path d="M6 1l1.545 3.13L11 4.635l-2.5 2.435.59 3.44L6 8.885l-3.09 1.625.59-3.44L1 4.635l3.455-.505z" /></svg>
            <span className="text-xs font-bold" style={{ color: "#0f5b47" }}>{Number(service.rating ?? 0).toFixed(1)}</span>
            <span className="text-[11px] text-gray-500">({service.reviewCount ?? 0})</span>
          </div>
          {service.category ? <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#e8dcc8] text-[#0f5b47]">{service.category}</span> : null}
        </div>

        <Link href={`/services/${service.id}`}>
          <h3 className="text-sm font-bold mb-1 leading-snug hover:underline" style={{ color: "#0f5b47" }}>{service.title}</h3>
        </Link>
        <p className="text-[11px] text-gray-600 mb-0.5">{service.vendorName}</p>
        {service.location ? <p className="text-[11px] text-gray-600 mb-3">📍 {service.location}</p> : <div className="mb-3" />}

        <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-gray-100">
          <div>
            <p className="text-[10px] text-gray-500">Starting at</p>
            <p className="text-sm font-bold" style={{ color: "#cba85a" }}>{lkr(service.discountedPrice ?? service.basePrice)}</p>
          </div>
          <button onClick={handleBook} className="text-white text-[11px] font-semibold px-3 py-2 rounded-lg transition-colors" style={{ backgroundColor: "#0f5b47" }}>
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recommended");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [sRes, cRes] = await Promise.all([
          fetch("/api/services", { cache: "no-store" }),
          fetch("/api/categories", { cache: "no-store" }),
        ]);
        const sData = await sRes.json();
        const cData = await cRes.json();
        if (!active) return;
        setServices(sData.services ?? []);
        setCategories(cData.categories ?? []);
        setError(!sRes.ok);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    let list = services.filter((s) => {
      const matchCat = activeCategory === "all" || s.categorySlug === activeCategory;
      const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || (s.vendorName ?? "").toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
    const price = (s: ServiceItem) => s.discountedPrice ?? s.basePrice;
    if (sort === "price-low") list = [...list].sort((a, b) => price(a) - price(b));
    if (sort === "price-high") list = [...list].sort((a, b) => price(b) - price(a));
    if (sort === "rating") list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return list;
  }, [services, activeCategory, search, sort]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f6f1" }}>
      <div className="px-6 md:px-8 pt-8 pb-1">
        <h1 className="text-2xl font-bold" style={{ color: "#0f5b47" }}>All Services</h1>
        <p className="text-sm mt-1" style={{ color: "#666" }}>
          <span className="font-bold text-xs px-2 py-0.5 rounded mr-1" style={{ backgroundColor: "#e8dcc8", color: "#0f5b47" }}>{filtered.length}</span>
          services available
        </p>
      </div>

      <div className="px-6 md:px-8 pt-5 flex gap-2 flex-wrap">
        <button onClick={() => setActiveCategory("all")} className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all" style={activeCategory === "all" ? { backgroundColor: "#0f5b47", color: "white" } : { color: "#0f5b47", backgroundColor: "white" }}>
          All Services
        </button>
        {categories.map((cat) => (
          <button key={cat.slug} onClick={() => setActiveCategory(cat.slug)} className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all" style={activeCategory === cat.slug ? { backgroundColor: "#0f5b47", color: "white" } : { color: "#0f5b47", backgroundColor: "white" }}>
            {cat.name}
          </button>
        ))}
      </div>

      <div className="px-6 md:px-8 py-4 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 gap-2 flex-1 min-w-50 max-w-sm">
          <svg className="shrink-0" style={{ color: "#999" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          <input type="text" placeholder="Search services or vendors..." value={search} onChange={(e) => setSearch(e.target.value)} className="py-2 text-sm bg-transparent outline-none w-full placeholder-gray-500" style={{ color: "#0f5b47" }} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none cursor-pointer" style={{ color: "#0f5b47" }}>
            <option value="recommended">Sort: Recommended</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button onClick={() => setViewMode("grid")} title="Grid view" className="px-2.5 py-2" style={{ backgroundColor: viewMode === "grid" ? "#0f5b47" : "white", color: viewMode === "grid" ? "white" : "#999" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
            </button>
            <button onClick={() => setViewMode("list")} title="List view" className="px-2.5 py-2" style={{ backgroundColor: viewMode === "list" ? "#0f5b47" : "white", color: viewMode === "list" ? "white" : "#999" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            </button>
          </div>
        </div>
      </div>

      <div className={`px-6 md:px-8 pb-12 ${viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" : "flex flex-col gap-4 max-w-2xl"}`}>
        {loading ? (
          [0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-72 animate-pulse rounded-xl bg-gray-200" />)
        ) : error ? (
          <div className="col-span-3 text-center py-20 text-rose-600">
            <p className="text-lg font-medium">Couldn’t load services</p>
            <p className="text-sm mt-1">Please refresh the page.</p>
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((s) => <ServiceCard key={s.id} service={s} />)
        ) : (
          <div className="col-span-3 text-center py-20" style={{ color: "#999" }}>
            <p className="text-lg font-medium">No services found</p>
            <p className="text-sm mt-1">Try a different category or search term</p>
          </div>
        )}
      </div>
    </div>
  );
}
