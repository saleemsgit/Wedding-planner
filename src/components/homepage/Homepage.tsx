"use client";

import {
  Calendar,
  Crown,
  Gift,
  Heart,
  MapPin,
  Search,
  Star,
  BookOpen,
  Camera,
  Car,
  Flower2,
  Lightbulb,
  Mic2,
  Music2,
  Palette,
  Shirt,
  Sparkles,
  Users,
  Gem,
  ChevronRight,
  ShieldCheck,
  Building2,
  Briefcase,
  Bell,
  TrendingUp,
  Send,
} from "lucide-react";
import { useEffect, useState } from "react";

// WEDDING JOURNEY EVENTS DATA
const events = [
  {
    id: "01",
    title: "Proposal",
    subtitle: "Begin your journey",
    emoji: "💍",
    color: "border-pink-200 bg-pink-50",
  },
  {
    id: "02",
    title: "Engagement",
    subtitle: "Sacred commitment",
    emoji: "🤝",
    color: "border-purple-200 bg-purple-50",
  },
  {
    id: "03",
    title: "Gift Exchange",
    subtitle: "Seer / Jahez ceremony",
    emoji: "🎁",
    color: "border-yellow-200 bg-yellow-50",
  },
  {
    id: "04",
    title: "Mehndi Night",
    subtitle: "Celebrate together",
    emoji: "🌿",
    color: "border-green-200 bg-green-50",
  },
  {
    id: "05",
    title: "Groom Arrival",
    subtitle: "Grand entrance",
    emoji: "👑",
    color: "border-blue-200 bg-blue-50",
  },
  {
    id: "06",
    title: "Nikah",
    subtitle: "Sacred union",
    emoji: "☪️",
    color: "border-orange-200 bg-orange-50",
  },
  {
    id: "07",
    title: "Walima",
    subtitle: "Blessed feast",
    emoji: "🎊",
    color: "border-cyan-200 bg-cyan-50",
  },
];

// SERVICES DATA
const services = [
  { title: "Wedding Halls", icon: Building2, color: "bg-[#1f5c4a]" },
  { title: "Catering", icon: Sparkles, color: "bg-[#d0a13b]" },
  { title: "Bridal Dressing", icon: Shirt, color: "bg-pink-500" },
  { title: "Groom Styling", icon: Shirt, color: "bg-blue-600" },
  { title: "Luxury Cars", icon: Car, color: "bg-slate-700" },
  { title: "Photography", icon: Camera, color: "bg-purple-600" },
  { title: "Mehndi Artists", icon: Flower2, color: "bg-green-500" },
  { title: "Gift Trays", icon: Gift, color: "bg-orange-500" },
  { title: "Jewelry", icon: Gem, color: "bg-amber-500" },
  { title: "Wedding Cards", icon: BookOpen, color: "bg-cyan-500" },
  { title: "Lighting & Decor", icon: Lightbulb, color: "bg-yellow-500" },
  { title: "Sound Systems", icon: Mic2, color: "bg-rose-500" },
  { title: "Religious Services", icon: BookOpen, color: "bg-[#0f5b47]" },
  { title: "Flower Arrangements", icon: Flower2, color: "bg-pink-500" },
  { title: "Videography", icon: Music2, color: "bg-sky-500" },
  { title: "Stage Decorations", icon: Palette, color: "bg-yellow-600" },
  { title: "Family Seating", icon: Users, color: "bg-[#2d6a4f]" },
];

type FeaturedVendor = {
  id: number;
  category: string;
  status: "Available" | "Limited" | "Booked";
  image: string;
  title: string;
  location: string;
  rating: string;
  reviews: string;
  price: string;
};

function normalizeBadge(badge: string | null | undefined): "Available" | "Limited" | "Booked" {
  switch (String(badge ?? "").toUpperCase()) {
    case "LIMITED":
      return "Limited";
    case "BOOKED":
      return "Booked";
    default:
      return "Available";
  }
}

function vendorFromApi(vendor: {
  id: number;
  businessName: string;
  category: string | null;
  location: string;
  rating: number;
  reviewCount: number;
  startingPrice: number | string | null;
  badge: string;
  image: string | null;
}): FeaturedVendor {
  const priceNum =
    typeof vendor.startingPrice === "number"
      ? vendor.startingPrice
      : vendor.startingPrice
      ? Number(vendor.startingPrice)
      : null;
  return {
    id: vendor.id,
    category: vendor.category || "Wedding Services",
    status: normalizeBadge(vendor.badge),
    image: vendor.image || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200&auto=format&fit=crop",
    title: vendor.businessName,
    location: vendor.location,
    rating: Number(vendor.rating ?? 0).toFixed(1),
    reviews: `${vendor.reviewCount ?? 0} reviews`,
    price: priceNum && !Number.isNaN(priceNum) ? `From LKR ${priceNum.toLocaleString()}` : "Contact for pricing",
  };
}

// TESTIMONIALS DATA
const testimonials = [
  {
    initials: "AR",
    name: "Amina & Rizwan",
    event: "Nikah & Walima",
    date: "March 2026",
    review:
      "This platform made planning our wedding so easy! From finding our Nikah venue to booking the Mehndi artists, everything was seamless and beautifully organized.",
  },
  {
    initials: "FA",
    name: "Fatima & Asif",
    event: "Full Wedding Package",
    date: "February 2026",
    review:
      "The vendor quality is exceptional. Our Mehndi night was absolutely perfect thanks to their recommendations. The Gift Exchange planner saved us so much time!",
  },
  {
    initials: "ZH",
    name: "Zainab & Haroon",
    event: "Engagement to Walima",
    date: "January 2026",
    review:
      "WeddingSL understood our Sri Lankan Muslim traditions perfectly. The platform helped us coordinate all 7 wedding events without any stress.",
  },
];

export default function HomePage() {
  const [featuredVendors, setFeaturedVendors] = useState<FeaturedVendor[]>([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(true);
  const [vendorLoadError, setVendorLoadError] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadVendors() {
      try {
        const response = await fetch("/api/vendors", { cache: "no-store" });
        const payload = await response.json();

        if (!active) return;

        if (response.ok && Array.isArray(payload.vendors) && payload.vendors.length > 0) {
          setFeaturedVendors(payload.vendors.slice(0, 3).map(vendorFromApi));
          setVendorLoadError(false);
        } else {
          setVendorLoadError(true);
          setFeaturedVendors([]);
        }
      } catch {
        if (active) {
          setVendorLoadError(true);
          setFeaturedVendors([]);
        }
      } finally {
        if (active) {
          setIsLoadingVendors(false);
        }
      }
    }

    void loadVendors();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f6f1] flex flex-col">
      {/* ========== MAIN CONTENT ========== */}
      <main className="grow">
      {/* ========== SECTION 1: HERO ========== */}
      <section className="relative overflow-hidden bg-[#0f5b47] text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-size-[40px_40px]" />

        <div className="relative max-w-7xl mx-auto px-6 py-24">
          {/* Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 border border-yellow-600/40 bg-yellow-500/10 text-yellow-300 px-5 py-2 rounded-full text-sm">
              <Star size={14} />
              Sri Lanka&apos;s Premier Muslim Wedding Platform
            </div>
          </div>

          {/* Heading */}
          <div className="max-w-5xl mx-auto text-center mt-10">
            <h1 className="text-5xl md:text-7xl font-serif leading-tight">
              Plan Your Dream
              <span className="block text-[#d6b062]">
                Sri Lankan Muslim
              </span>
              Wedding Effortlessly
            </h1>

            <p className="mt-8 text-xl text-gray-200 max-w-3xl mx-auto">
              From Proposal to Walima — discover, book, and coordinate every
              detail of your perfect celebration
            </p>
          </div>

          {/* Search Box */}
          <div className="max-w-5xl mx-auto mt-14 bg-white rounded-3xl p-4 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 bg-[#f6f3ed] rounded-2xl px-5 py-4">
                <Search className="text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="Search services..."
                  className="bg-transparent outline-none text-black w-full"
                />
              </div>

              <div className="flex items-center gap-3 bg-[#f6f3ed] rounded-2xl px-5 py-4">
                <MapPin className="text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="Location"
                  className="bg-transparent outline-none text-black w-full"
                />
              </div>

              <div className="flex items-center gap-3 bg-[#f6f3ed] rounded-2xl px-5 py-4">
                <Calendar className="text-gray-500" size={20} />
                <input
                  type="date"
                  className="bg-transparent outline-none text-black w-full"
                />
              </div>

              <button className="bg-[#cba85a] hover:bg-[#b79549] transition rounded-2xl px-6 py-4 text-lg font-medium flex items-center justify-center gap-3 text-[#0f5b47]">
                <Search size={20} />
                Search
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-5 mt-10">
            <a href="/my-planner" className="bg-[#cba85a] hover:bg-[#b79549] transition px-8 py-4 rounded-2xl flex items-center gap-3 text-[#0f5b47] font-medium no-underline">
              <Heart size={18} />
              Start Planning
            </a>

            <a href="/services" className="border border-white/30 bg-white/10 hover:bg-white/20 transition px-8 py-4 rounded-2xl flex items-center gap-3 font-medium text-white no-underline">
              <Search size={18} />
              Explore Vendors
            </a>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-14 text-[#d6b062]">
            <div className="flex items-center gap-2">
              <Star size={16} />
              500+ Verified Vendors
            </div>

            <div className="flex items-center gap-2">
              <Heart size={16} />
              1,200+ Happy Couples
            </div>

            <div className="flex items-center gap-2">
              <Gift size={16} />
              All 7 Wedding Events
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 2: WEDDING JOURNEY ========== */}
      <section className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Top Badge */}
          <div className="flex justify-center">
            <div className="border border-yellow-200 bg-yellow-50 text-[#cba85a] px-5 py-2 rounded-full text-sm">
              Seven Blessed Events
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mt-8">
            <h2 className="text-5xl font-serif text-[#0f5b47]">
              Your Wedding Journey
            </h2>

            <p className="text-gray-600 mt-5 text-xl max-w-3xl mx-auto">
              Seven beautiful stages of celebration, from the first proposal to
              the blessed Walima feast
            </p>
          </div>

          {/* Timeline Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-5 mt-20">
            {events.map((event) => (
              <div
                key={event.id}
                className={`rounded-3xl border p-6 text-center hover:-translate-y-2 transition duration-300 ${event.color}`}
              >
                <div className="text-4xl">{event.emoji}</div>

                <p className="text-gray-500 text-sm mt-5">{event.id}</p>

                <h3 className="text-[#0f5b47] text-2xl font-serif mt-2">
                  {event.title}
                </h3>

                <p className="text-gray-600 text-sm mt-3">
                  {event.subtitle}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========== SECTION 3: SERVICES ========== */}
      <section className="py-28 px-6 bg-[#f8f6f1]">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center">
            <div className="border border-[#e7d8b3] bg-[#fffaf0] text-[#c9a24f] px-5 py-2 rounded-full text-sm">
              Complete Wedding Services
            </div>
          </div>

          <div className="text-center mt-8">
            <h2 className="text-5xl md:text-6xl font-serif text-[#0f5b47]">
              Explore All Services
            </h2>

            <p className="text-gray-600 mt-5 text-xl">
              Everything you need from A to Z for your perfect wedding
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 mt-20">
            {services.map((service, index) => {
              const Icon = service.icon;

              return (
                <div
                  key={index}
                  className="bg-white border border-[#efe5d0] rounded-3xl p-8 hover:shadow-xl hover:-translate-y-2 transition duration-300 cursor-pointer"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl ${service.color} flex items-center justify-center mx-auto shadow-lg`}
                  >
                    <Icon className="text-white" size={24} />
                  </div>

                  <h3 className="text-center text-[#0f5b47] mt-6 font-medium">
                    {service.title}
                  </h3>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== SECTION 4: FEATURED VENDORS ========== */}
      <section className="pb-32 px-6 bg-[#f8f6f1]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 border border-[#e7d8b3] bg-[#fffaf0] text-[#c9a24f] px-5 py-2 rounded-full text-sm">
                <Star size={14} />
                Top Rated
              </div>

              <h2 className="text-5xl md:text-6xl font-serif text-[#0f5b47] mt-6">
                Featured Vendors
              </h2>

              <p className="text-gray-600 mt-4 text-xl">
                Trusted by hundreds of couples across Sri Lanka
              </p>
            </div>

            <button className="mt-8 md:mt-0 border border-[#d8b15c] text-[#c9a24f] px-8 py-4 rounded-2xl hover:bg-[#c9a24f] hover:text-white transition flex items-center gap-2">
              View All
              <ChevronRight size={18} />
            </button>
          </div>

          {vendorLoadError && !isLoadingVendors && (
            <p className="mt-4 text-sm text-[#8b6d2a]">
              Live vendor data could not be loaded from the database.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {isLoadingVendors ? (
              <div className="col-span-3 rounded-[30px] border border-dashed border-[#e7d8b3] bg-white px-6 py-14 text-center text-gray-500 shadow-sm">
                Loading featured vendors from the database...
              </div>
            ) : featuredVendors.length > 0 ? (
              featuredVendors.map((vendor) => (
              <div
                key={vendor.id}
                className="bg-white rounded-[30px] overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 hover:-translate-y-2"
              >
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={vendor.image}
                    alt={vendor.title}
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />

                  <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-sm text-[#0f5b47]">
                    {vendor.category}
                  </div>

                  <div
                    className={`absolute top-5 right-5 px-4 py-2 rounded-full text-sm text-white ${
                      vendor.status === "Available"
                        ? "bg-green-500"
                        : "bg-orange-500"
                    }`}
                  >
                    {vendor.status}
                  </div>

                  <div className="absolute bottom-5 left-5 flex items-center gap-2 text-white">
                    <ShieldCheck size={16} className="text-[#d6b062]" />
                    Verified Vendor
                  </div>
                </div>

                <div className="p-7">
                  <div className="flex items-center gap-2 text-[#c9a24f]">
                    <Star size={16} fill="currentColor" />
                    <span className="font-semibold">{vendor.rating}</span>
                    <span className="text-gray-500">
                      ({vendor.reviews})
                    </span>
                  </div>

                  <h3 className="text-3xl font-serif text-[#0f5b47] mt-5">
                    {vendor.title}
                  </h3>

                  <div className="flex items-center gap-2 text-gray-500 mt-4">
                    <MapPin size={16} />
                    {vendor.location}
                  </div>

                  <div className="border-t border-gray-200 my-6" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Starting at</p>
                      <p className="text-3xl font-semibold text-[#c9a24f] mt-1">
                        {vendor.price}
                      </p>
                    </div>

                    <a href="/services" className="bg-[#f7f1e4] hover:bg-[#c9a24f] hover:text-white transition px-6 py-3 rounded-2xl text-[#c9a24f] inline-block no-underline">
                      View Details
                    </a>
                  </div>
                </div>
              </div>
              ))
            ) : (
              <div className="col-span-3 rounded-[30px] border border-dashed border-[#e7d8b3] bg-white px-6 py-14 text-center text-gray-500 shadow-sm">
                No featured vendors have been stored in the database yet.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========== SECTION 5: AI RECOMMENDATIONS ========== */}
      <section className="py-24 px-6 bg-[#f8f6f1]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 border border-[#eadfcb] px-5 py-3 rounded-full text-[#c69d47] bg-[#faf7f0] mb-8">
              <Briefcase size={16} />
              AI-Powered Planning
            </div>

            <h2 className="text-5xl lg:text-6xl leading-tight font-serif mb-8 text-[#0f5942]">
              Smart Recommendations
              <br />
              Just for You
            </h2>

            <p className="text-[#607067] text-xl leading-10 mb-10 max-w-2xl">
              Our AI wedding assistant analyzes your budget, dates, and
              preferences to suggest the perfect vendors, themes, and timeline
              specifically for Sri Lankan Muslim weddings.
            </p>

            <div className="space-y-5 mb-10">
              <div className="border border-[#b7ebc6] bg-[#eef9f0] rounded-3xl p-6 flex gap-4 items-start">
                <TrendingUp className="text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg text-green-700">
                    Budget Tip
                  </h3>
                  <p className="text-green-600 mt-1">
                    Book your hall 6 months early to save up to 15% on venue
                    costs.
                  </p>
                </div>
              </div>

              <div className="border border-[#f2d18d] bg-[#fff8e9] rounded-3xl p-6 flex gap-4 items-start">
                <Bell className="text-[#d27d1f] mt-1" />
                <div>
                  <h3 className="font-semibold text-lg text-[#c86d08]">
                    Timeline Alert
                  </h3>
                  <p className="text-[#d17f2f] mt-1">
                    Mehndi artists in Colombo book out fast. Reserve yours 3
                    months ahead.
                  </p>
                </div>
              </div>

              <div className="border border-[#e2ccff] bg-[#f7efff] rounded-3xl p-6 flex gap-4 items-start">
                <Sparkles className="text-[#7d3df2] mt-1" />
                <div>
                  <h3 className="font-semibold text-lg text-[#7d3df2]">
                    Trending Now
                  </h3>
                  <p className="text-[#9a5eff] mt-1">
                    Royal Mughal Mehndi themes are trending this season among
                    Sri Lankan brides.
                  </p>
                </div>
              </div>
            </div>

            <button className="bg-[#0f5a43] hover:bg-[#0d4a38] transition-all text-white px-10 py-5 rounded-2xl text-lg font-semibold flex items-center gap-3 shadow-lg">
              <Briefcase size={20} />
              Get AI Recommendations
            </button>
          </div>

          <div className="bg-[#0f5a43] rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-size-[30px_30px]"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-full bg-[#d6b256] flex items-center justify-center">
                  <Briefcase className="text-white" />
                </div>

                <div>
                  <h2 className="font-semibold text-2xl">
                    Wedding AI Assistant
                  </h2>
                  <p className="text-[#d7e8dd] text-sm">
                    Online • Ready to help
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="bg-[#3d745f] p-5 rounded-3xl max-w-[90%]">
                  Assalamu Alaikum! 🌙 I'm your personal wedding planner. When
                  is your Nikah date?
                </div>

                <div className="bg-[#6e8552] p-5 rounded-3xl ml-auto max-w-[75%]">
                  July 15, 2026 in Colombo
                </div>

                <div className="bg-[#3d745f] p-5 rounded-3xl max-w-[90%]">
                  Perfect! I suggest booking your hall by January. Here are 3
                  premium venues available on that date... ✨
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Ask me anything about your wedding..."
                  className="flex-1 bg-[#3f755f] text-white placeholder:text-[#d1ddd5] px-6 py-5 rounded-2xl outline-none"
                />

                <button className="w-16 h-16 rounded-2xl bg-[#d8b55b] flex items-center justify-center hover:scale-105 transition-all">
                  <Send />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 6: TESTIMONIALS ========== */}
      <section className="bg-[#0f5a43] py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-size-[40px_40px]"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 border border-[#8ba89a] text-[#d8b55b] px-6 py-3 rounded-full mb-6">
              <Heart size={16} />
              Love Stories
            </div>

            <h2 className="text-5xl lg:text-6xl text-white font-serif mb-5">
              Couples Love Us
            </h2>

            <p className="text-[#d8e6df] text-xl">
              Read what our happy couples have to say
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((item, index) => (
              <div
                key={index}
                className="bg-[#3f715f]/70 backdrop-blur-sm border border-[#789688] rounded-[30px] p-8 hover:-translate-y-2 transition-all duration-300"
              >
                <div className="flex gap-1 mb-8">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-[#d8b55b] fill-[#d8b55b]"
                    />
                  ))}
                </div>

                <p className="text-[#f2f6f3] text-xl leading-10 mb-10">
                  "{item.review}"
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#d8b55b] text-[#0f5a43] font-bold flex items-center justify-center">
                      {item.initials}
                    </div>

                    <div>
                      <h4 className="text-white font-semibold text-lg">
                        {item.name}
                      </h4>
                      <p className="text-[#d6e4dd] text-sm">{item.event}</p>
                    </div>
                  </div>

                  <span className="text-[#d6e4dd] text-sm">
                    {item.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </main>

      {/* ========== FOOTER SECTION ========== */}
      <footer className="w-full bg-[#1E3A2B] text-gray-300 text-xs py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-emerald-800">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#D4A373] flex items-center justify-center text-white">
                <Heart size={16} fill="currentColor" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white tracking-tight leading-none">WeddingSL</h3>
                <p className="text-[10px] text-gray-400">Muslim Wedding Platform</p>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-xs">
              Sri Lanka&apos;s most trusted platform for planning the perfect Muslim wedding, from Proposal to Walima.
            </p>
            {/* Social Icons */}
            <div className="flex items-center space-x-3 pt-2">
              <a href="#" className="w-7 h-7 rounded-full bg-emerald-900 flex items-center justify-center hover:bg-emerald-800 transition text-[10px] font-bold">
                f
              </a>
              <a href="#" className="w-7 h-7 rounded-full bg-emerald-900 flex items-center justify-center hover:bg-emerald-800 transition text-[10px] font-bold">
                in
              </a>
              <a href="#" className="w-7 h-7 rounded-full bg-emerald-900 flex items-center justify-center hover:bg-emerald-800 transition text-[10px] font-bold">
                wa
              </a>
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Services</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/services" className="hover:text-white transition">Wedding Halls</a></li>
              <li><a href="/services" className="hover:text-white transition">Catering</a></li>
              <li><a href="/services" className="hover:text-white transition">Photography</a></li>
              <li><a href="/services" className="hover:text-white transition">Bridal Services</a></li>
              <li><a href="/services" className="hover:text-white transition">Mehndi Artists</a></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Planning</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/my-planner" className="hover:text-white transition">My Planner</a></li>
              <li><a href="/gift-exchange" className="hover:text-white transition">Gift Exchange</a></li>
              <li><a href="/mehndi-night" className="hover:text-white transition">Mehndi Night</a></li>
              <li><a href="#" className="hover:text-white transition">Budget Tracker</a></li>
              <li><a href="#" className="hover:text-white transition">Nikah Booking</a></li>
            </ul>
          </div>

          {/* Links Column 3 */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">About Us</a></li>
              <li><a href="#" className="hover:text-white transition">Contact</a></li>
              <li><a href="#" className="hover:text-white transition">Become a Vendor</a></li>
              <li><a href="#" className="hover:text-white transition">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-gray-400 text-[11px]">
          <p>© 2026 WeddingSL. All rights reserved. Built with ❤️ for Sri Lankan Muslim Weddings.</p>
          <p className="mt-2 sm:mt-0 text-[#D4A373]">May Allah bless every union 🤲</p>
        </div>
      </footer>
    </div>
  );
}