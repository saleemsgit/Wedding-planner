"use client";

import {
  BookOpen,
  Camera,
  Car,
  Flower2,
  Gift,
  Lightbulb,
  MapPin,
  Mic2,
  Music2,
  Palette,
  Shirt,
  Sparkles,
  Star,
  Users,
  Gem,
  ChevronRight,
  ShieldCheck,
  Building2,
} from "lucide-react";

const services = [
  {
    title: "Wedding Halls",
    icon: Building2,
    color: "bg-[#1f5c4a]",
  },
  {
    title: "Catering",
    icon: Sparkles,
    color: "bg-[#d0a13b]",
  },
  {
    title: "Bridal Dressing",
    icon: Shirt,
    color: "bg-pink-500",
  },
  {
    title: "Groom Styling",
    icon: Shirt,
    color: "bg-blue-600",
  },
  {
    title: "Luxury Cars",
    icon: Car,
    color: "bg-slate-700",
  },
  {
    title: "Photography",
    icon: Camera,
    color: "bg-purple-600",
  },
  {
    title: "Mehndi Artists",
    icon: Flower2,
    color: "bg-green-500",
  },
  {
    title: "Gift Trays",
    icon: Gift,
    color: "bg-orange-500",
  },
  {
    title: "Jewelry",
    icon: Gem,
    color: "bg-amber-500",
  },
  {
    title: "Wedding Cards",
    icon: BookOpen,
    color: "bg-cyan-500",
  },
  {
    title: "Lighting & Decor",
    icon: Lightbulb,
    color: "bg-yellow-500",
  },
  {
    title: "Sound Systems",
    icon: Mic2,
    color: "bg-rose-500",
  },
  {
    title: "Religious Services",
    icon: BookOpen,
    color: "bg-[#0f5b47]",
  },
  {
    title: "Flower Arrangements",
    icon: Flower2,
    color: "bg-pink-500",
  },
  {
    title: "Videography",
    icon: Music2,
    color: "bg-sky-500",
  },
  {
    title: "Stage Decorations",
    icon: Palette,
    color: "bg-yellow-600",
  },
  {
    title: "Family Seating",
    icon: Users,
    color: "bg-[#2d6a4f]",
  },
];

const vendors = [
  {
    category: "Wedding Hall",
    status: "Available",
    image:
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200&auto=format&fit=crop",
    title: "Royal Gardens Banquet Hall",
    location: "Colombo 07",
    rating: "4.9",
    reviews: "156 reviews",
    price: "LKR 350,000",
  },
  {
    category: "Photography",
    status: "Available",
    image:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop",
    title: "Elegant Moments Photography",
    location: "Dehiwala",
    rating: "5",
    reviews: "203 reviews",
    price: "LKR 85,000",
  },
  {
    category: "Bridal Dressing",
    status: "Limited",
    image:
      "https://images.unsplash.com/photo-1525258946800-98cfd641d0de?q=80&w=1200&auto=format&fit=crop",
    title: "Luxury Bridal Boutique",
    location: "Wellawatte",
    rating: "4.8",
    reviews: "127 reviews",
    price: "LKR 120,000",
  },
];

export default function ServicesSection() {
  return (
    <div className="bg-[#f8f6f1]">
      {/* SERVICES SECTION */}
      <section className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center">
            <div className="border border-[#e7d8b3] bg-[#fffaf0] text-[#c9a24f] px-5 py-2 rounded-full text-sm">
              Complete Wedding Services
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mt-8">
            <h2 className="text-5xl md:text-6xl font-serif text-[#0f5b47]">
              Explore All Services
            </h2>

            <p className="text-gray-600 mt-5 text-xl">
              Everything you need from A to Z for your perfect wedding
            </p>
          </div>

          {/* Services Grid */}
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

      {/* FEATURED VENDORS */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Top Row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              {/* Badge */}
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

            {/* View All */}
            <button className="mt-8 md:mt-0 border border-[#d8b15c] text-[#c9a24f] px-8 py-4 rounded-2xl hover:bg-[#c9a24f] hover:text-white transition flex items-center gap-2">
              View All
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Vendor Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {vendors.map((vendor, index) => (
              <div
                key={index}
                className="bg-white rounded-[30px] overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 hover:-translate-y-2"
              >
                {/* Image */}
                <div className="relative h-[320px] overflow-hidden">
                  <img
                    src={vendor.image}
                    alt={vendor.title}
                    className="w-full h-full object-cover"
                  />

                  {/* Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                  {/* Category */}
                  <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-sm text-[#0f5b47]">
                    {vendor.category}
                  </div>

                  {/* Status */}
                  <div
                    className={`absolute top-5 right-5 px-4 py-2 rounded-full text-sm text-white ${
                      vendor.status === "Available"
                        ? "bg-green-500"
                        : "bg-orange-500"
                    }`}
                  >
                    {vendor.status}
                  </div>

                  {/* Verified */}
                  <div className="absolute bottom-5 left-5 flex items-center gap-2 text-white">
                    <ShieldCheck size={16} className="text-[#d6b062]" />
                    Verified Vendor
                  </div>
                </div>

                {/* Content */}
                <div className="p-7">
                  {/* Rating */}
                  <div className="flex items-center gap-2 text-[#c9a24f]">
                    <Star size={16} fill="currentColor" />
                    <span className="font-semibold">{vendor.rating}</span>
                    <span className="text-gray-500">
                      ({vendor.reviews})
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-3xl font-serif text-[#0f5b47] mt-5">
                    {vendor.title}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-gray-500 mt-4">
                    <MapPin size={16} />
                    {vendor.location}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200 my-6" />

                  {/* Bottom */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Starting at</p>

                      <p className="text-3xl font-semibold text-[#c9a24f] mt-1">
                        {vendor.price}
                      </p>
                    </div>

                    <button className="bg-[#f7f1e4] hover:bg-[#c9a24f] hover:text-white transition px-6 py-3 rounded-2xl text-[#c9a24f]">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}