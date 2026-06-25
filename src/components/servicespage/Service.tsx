"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Star, MapPin, BadgeCheck, SlidersHorizontal, Search } from "lucide-react";

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
  capacity: number | null;
  isFeatured: boolean;
  badge: string;
  coverImage: string | null;
  image: string | null;
}

const badgeConfig: Record<string, string> = {
  AVAILABLE: "bg-emerald-600 text-white",
  LIMITED: "bg-amber-600 text-white",
  BOOKED: "bg-rose-600 text-white",
};

const FALLBACK_IMG = "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80";

function lkr(n: number | null | undefined) {
  return n == null ? "Contact for pricing" : `LKR ${Number(n).toLocaleString()}`;
}

function ServiceCard({ service }: { service: ServiceItem }) {
  const img = service.coverImage || service.image || FALLBACK_IMG;
  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-[#e8dcc8] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/services/${service.id}`} className="relative block h-52 overflow-hidden">
        <img src={img} alt={service.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow ${badgeConfig[String(service.badge).toUpperCase()] ?? "bg-emerald-600 text-white"}`}>{String(service.badge).toLowerCase()}</span>
          {service.isFeatured ? <span className="rounded-full bg-[#cba85a] px-2.5 py-0.5 text-[10px] font-bold text-white shadow">Featured</span> : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs font-bold text-[#0f5b47]"><Star className="h-3.5 w-3.5 fill-[#cba85a] text-[#cba85a]" /> {Number(service.rating ?? 0).toFixed(1)} <span className="font-normal text-gray-400">({service.reviewCount ?? 0})</span></span>
          {service.category ? <span className="rounded-full bg-[#e8dcc8] px-2 py-0.5 text-[10px] font-medium text-[#0f5b47]">{service.category}</span> : null}
        </div>
        <Link href={`/services/${service.id}`}><h3 className="font-serif text-lg leading-snug text-[#0f5b47] hover:underline">{service.title}</h3></Link>
        <p className="mt-0.5 text-xs text-gray-500">{service.vendorName}</p>
        <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-gray-500">
          {service.location ? <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {service.location}</span> : null}
          {service.capacity ? <span className="flex items-center gap-1"><BadgeCheck className="h-3 w-3" /> {service.capacity} guests</span> : null}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#f0e6d6] pt-3">
          <div>
            <p className="text-[10px] text-gray-400">Starting at</p>
            <p className="text-base font-bold text-[#cba85a]">{lkr(service.discountedPrice ?? service.basePrice)}</p>
          </div>
          <div className="flex gap-1.5">
            <Link href={`/services/${service.id}`} className="rounded-xl border border-[#0f5b47] px-3 py-2 text-xs font-semibold text-[#0f5b47] transition hover:bg-[#0f5b47]/5">Details</Link>
            <Link href={`/services/${service.id}`} className="rounded-xl bg-[#0f5b47] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#0c4a3a]">Book Now</Link>
          </div>
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
  const [location, setLocation] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

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

  const locations = useMemo(
    () => Array.from(new Set(services.map((s) => s.location).filter(Boolean))) as string[],
    [services]
  );

  const priceBands: Record<string, [number, number]> = {
    "0-100000": [0, 100000],
    "100000-300000": [100000, 300000],
    "300000-600000": [300000, 600000],
    "600000+": [600000, Infinity],
  };

  const filtered = useMemo(() => {
    let list = services.filter((s) => {
      const price = s.discountedPrice ?? s.basePrice;
      const matchCat = activeCategory === "all" || s.categorySlug === activeCategory;
      const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || (s.vendorName ?? "").toLowerCase().includes(search.toLowerCase());
      const matchLoc = location === "all" || s.location === location;
      const matchFeatured = !featuredOnly || s.isFeatured;
      const band = priceRange === "all" ? null : priceBands[priceRange];
      const matchPrice = !band || (price >= band[0] && price <= band[1]);
      return matchCat && matchSearch && matchLoc && matchFeatured && matchPrice;
    });
    const price = (s: ServiceItem) => s.discountedPrice ?? s.basePrice;
    if (sort === "price-low") list = [...list].sort((a, b) => price(a) - price(b));
    if (sort === "price-high") list = [...list].sort((a, b) => price(b) - price(a));
    if (sort === "rating") list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    if (sort === "featured") list = [...list].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
    return list;
  }, [services, activeCategory, search, sort, location, priceRange, featuredOnly]);

  return (
    <div className="min-h-screen bg-[#f8f6f1]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0f5b47] via-[#11503f] to-[#1b6b52] text-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <p className="text-xs uppercase tracking-[0.28em] text-white/70">Wedding Marketplace</p>
          <h1 className="mt-2 font-serif text-3xl md:text-4xl">Discover premium wedding services</h1>
          <p className="mt-2 max-w-2xl text-white/80">Halls, catering, photography and more — compare packages and book in minutes.</p>
        </div>
      </div>

      {/* Category chips */}
      <div className="mx-auto flex max-w-7xl flex-wrap gap-2 px-6 pt-6">
        <Chip active={activeCategory === "all"} onClick={() => setActiveCategory("all")}>All Services</Chip>
        {categories.map((c) => <Chip key={c.slug} active={activeCategory === c.slug} onClick={() => setActiveCategory(c.slug)}>{c.name}</Chip>)}
      </div>

      {/* Search + filter toggle */}
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services or vendors…" className="w-full rounded-full border border-[#e8dcc8] bg-white py-2.5 pl-10 pr-4 text-sm text-[#0f5b47] outline-none focus:border-[#cba85a]" />
        </div>
        <div className="flex items-center gap-2">
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-full border border-[#e8dcc8] bg-white px-4 py-2.5 text-sm text-[#0f5b47] outline-none">
            <option value="recommended">Sort: Recommended</option>
            <option value="featured">Featured first</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
          <button onClick={() => setShowFilters((v) => !v)} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium ${showFilters ? "border-[#0f5b47] bg-[#0f5b47] text-white" : "border-[#e8dcc8] bg-white text-[#0f5b47]"}`}>
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters ? (
        <div className="mx-auto max-w-7xl px-6 pb-2">
          <div className="grid gap-3 rounded-2xl border border-[#e8dcc8] bg-white p-4 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-[#0f5b47]">Location</span>
              <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded-xl border border-[#e8dcc8] px-3 py-2 text-sm text-[#0f5b47] outline-none">
                <option value="all">All locations</option>
                {locations.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-[#0f5b47]">Price range (LKR)</span>
              <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="w-full rounded-xl border border-[#e8dcc8] px-3 py-2 text-sm text-[#0f5b47] outline-none">
                <option value="all">Any price</option>
                <option value="0-100000">Under 100,000</option>
                <option value="100000-300000">100,000 – 300,000</option>
                <option value="300000-600000">300,000 – 600,000</option>
                <option value="600000+">600,000+</option>
              </select>
            </label>
            <label className="flex items-end gap-2 pb-1">
              <input type="checkbox" checked={featuredOnly} onChange={(e) => setFeaturedOnly(e.target.checked)} className="h-5 w-5 rounded accent-[#0f5b47]" />
              <span className="text-sm font-medium text-[#0f5b47]">Featured only</span>
            </label>
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-7xl px-6 pb-2 pt-2 text-sm text-gray-500">
        <span className="rounded-full bg-[#e8dcc8] px-2 py-0.5 text-xs font-bold text-[#0f5b47]">{filtered.length}</span> services available
      </div>

      {/* Grid */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 pb-14 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-80 animate-pulse rounded-3xl bg-gray-200" />)
        ) : error ? (
          <div className="col-span-full py-20 text-center text-rose-600"><p className="text-lg font-medium">Couldn’t load services</p><p className="mt-1 text-sm">Please refresh the page.</p></div>
        ) : filtered.length ? (
          filtered.map((s) => <ServiceCard key={s.id} service={s} />)
        ) : (
          <div className="col-span-full py-20 text-center text-gray-500"><p className="text-lg font-medium">No services found</p><p className="mt-1 text-sm">Try adjusting your filters or search.</p></div>
        )}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${active ? "bg-[#0f5b47] text-white" : "border border-[#e8dcc8] bg-white text-[#0f5b47] hover:bg-[#fbf7ef]"}`}>{children}</button>;
}
