import Link from "next/link";
import {
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  CircleAlert,
  CreditCard,
  Gift,
  HeartHandshake,
  ShieldCheck,
  TrendingUp,
  Users,
  UtensilsCrossed,
  VenetianMask,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import CreateVendorForm from "@/components/admin/CreateVendorForm";

type DashboardBooking = {
  id: number;
  service: string;
  category: string;
  date: string;
  bookingDate: string;
  amount: number;
  packageName: string | null;
  status: "confirmed" | "pending" | "cancelled";
  userName: string;
  vendorName: string;
};

type DashboardVendor = {
  id: number;
  businessName: string;
  category: string;
  location: string;
  rating: number;
  reviewCount: number;
  packages: number;
  verified: boolean;
  badge: "Available" | "Limited" | "Booked";
};

type DashboardUser = {
  id: number;
  name: string;
  email: string;
  planningProgress: number;
  location: string | null;
};

type WeddingModule = {
  title: string;
  subtitle: string;
  href: string;
  tone: string;
};

const fallbackVendors: DashboardVendor[] = [
  { id: 1, businessName: "Royal Gardens Banquet Hall", category: "Wedding Halls", location: "Colombo 07", rating: 4.9, reviewCount: 156, packages: 3, verified: true, badge: "Available" },
  { id: 2, businessName: "Gourmet Catering Services", category: "Catering", location: "Mount Lavinia", rating: 4.8, reviewCount: 189, packages: 4, verified: true, badge: "Limited" },
  { id: 3, businessName: "Elegant Moments Photography", category: "Photography", location: "Dehiwala", rating: 5, reviewCount: 203, packages: 4, verified: true, badge: "Available" },
  { id: 4, businessName: "Zara Mehndi Designs", category: "Mehndi", location: "Bambalapitiya", rating: 4.9, reviewCount: 215, packages: 2, verified: true, badge: "Booked" },
];

const fallbackBookings: DashboardBooking[] = [
  { id: 1, service: "Royal Gardens Banquet Hall", category: "Wedding Halls", date: "2026-07-16", bookingDate: "2026-04-15", amount: 350000, packageName: "Premium", status: "confirmed", userName: "Amina Rahman", vendorName: "Royal Gardens Banquet Hall" },
  { id: 2, service: "Gourmet Catering Services", category: "Catering", date: "2026-07-16", bookingDate: "2026-04-18", amount: 480000, packageName: "Royal Buffet", status: "confirmed", userName: "Amina Rahman", vendorName: "Gourmet Catering Services" },
  { id: 3, service: "Elegant Moments Photography", category: "Photography", date: "2026-07-15", bookingDate: "2026-04-20", amount: 85000, packageName: "Cinematic", status: "pending", userName: "Amina Rahman", vendorName: "Elegant Moments Photography" },
];

const fallbackUsers: DashboardUser[] = [
  { id: 1, name: "Amina Rahman", email: "amina.rahman@email.com", planningProgress: 42, location: "Colombo, Sri Lanka" },
  { id: 2, name: "Fatima Hassan", email: "fatima@example.com", planningProgress: 68, location: "Negombo, Sri Lanka" },
  { id: 3, name: "Mariam Ali", email: "mariam@example.com", planningProgress: 24, location: "Kandy, Sri Lanka" },
];

const weddingModules: WeddingModule[] = [
  { title: "Proposal", subtitle: "Lead couples into the booking flow", href: "/", tone: "from-pink-100 to-rose-50" },
  { title: "Engagement", subtitle: "Track early planning milestones", href: "/my-planner", tone: "from-purple-100 to-violet-50" },
  { title: "Gift Exchange", subtitle: "Keep ceremonial lists in sync", href: "/gift-exchange", tone: "from-amber-100 to-yellow-50" },
  { title: "Mehndi Night", subtitle: "Align artist and decor services", href: "/mehndi-night", tone: "from-emerald-100 to-green-50" },
  { title: "Nikah", subtitle: "Highlight religious service bookings", href: "/services", tone: "from-sky-100 to-cyan-50" },
  { title: "Walima", subtitle: "Close the journey with premium venues", href: "/services", tone: "from-orange-100 to-amber-50" },
];

function formatLkr(amount: number) {
  return `LKR ${amount.toLocaleString()}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function AdminPage() {
  const [vendorsRaw, bookingsRaw, usersRaw] = await Promise.all([
    prisma.vendor.findMany({ orderBy: [{ verified: "desc" }, { rating: "desc" }] }),
    prisma.booking.findMany({
      orderBy: { bookingDate: "desc" },
      include: { user: true, vendor: true },
    }),
    prisma.user.findMany({ orderBy: { planningProgress: "desc" } }),
  ]);

  const vendors: DashboardVendor[] = vendorsRaw.length
    ? vendorsRaw.map((vendor) => ({
        id: vendor.id,
        businessName: vendor.businessName,
        category: vendor.category,
        location: vendor.location,
        rating: vendor.rating,
        reviewCount: vendor.reviewCount,
        packages: vendor.packages,
        verified: vendor.verified,
        badge: vendor.badge,
      }))
    : fallbackVendors;

  const bookings: DashboardBooking[] = bookingsRaw.length
    ? bookingsRaw.map((booking) => ({
        id: booking.id,
        service: booking.service,
        category: booking.category,
        date: booking.date.toISOString(),
        bookingDate: booking.bookingDate.toISOString(),
        amount: booking.amount,
        packageName: booking.packageName,
        status: booking.status,
        userName: booking.user.name,
        vendorName: booking.vendor.businessName,
      }))
    : fallbackBookings;

  const users: DashboardUser[] = usersRaw.length
    ? usersRaw.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        planningProgress: user.planningProgress,
        location: user.location,
      }))
    : fallbackUsers;

  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.amount, 0);
  const confirmedBookings = bookings.filter((booking) => booking.status === "confirmed").length;
  const pendingBookings = bookings.filter((booking) => booking.status === "pending").length;
  const verifiedVendors = vendors.filter((vendor) => vendor.verified).length;
  const avgProgress = Math.round(users.reduce((sum, user) => sum + user.planningProgress, 0) / Math.max(users.length, 1));

  const statusTone: Record<DashboardBooking["status"], string> = {
    confirmed: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    cancelled: "bg-rose-100 text-rose-700",
  };

  const badgeTone: Record<DashboardVendor["badge"], string> = {
    Available: "bg-emerald-100 text-emerald-700",
    Limited: "bg-amber-100 text-amber-700",
    Booked: "bg-rose-100 text-rose-700",
  };

  return (
    <main className="min-h-screen bg-[#fbf7ef] text-[#17352c]">
      <section className="relative overflow-hidden border-b border-[#eadfcb] bg-linear-to-br from-[#123f34] via-[#184c3e] to-[#d2ad5f] text-white">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_top_right,white_0,transparent_40%),radial-gradient(circle_at_bottom_left,white_0,transparent_35%)]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.28em] text-white/85">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin Control Center
            </p>
            <h1 className="font-serif text-4xl leading-tight md:text-6xl">
              WeddingSL admin dashboard
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/80 md:text-base">
              Monitor vendors, bookings, and couples from a single premium workspace. This route is wired to Prisma and uses the current database credentials in the project env file.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-90 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
              <p className="text-xs uppercase tracking-[0.25em] text-white/65">Revenue</p>
              <p className="mt-3 text-2xl font-semibold">{formatLkr(totalRevenue)}</p>
              <p className="mt-1 text-sm text-white/70">From all visible bookings</p>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
              <p className="text-xs uppercase tracking-[0.25em] text-white/65">Approval rate</p>
              <p className="mt-3 text-2xl font-semibold">{verifiedVendors}/{vendors.length}</p>
              <p className="mt-1 text-sm text-white/70">Verified vendors</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Bookings" value={String(bookings.length)} detail={`${confirmedBookings} confirmed`} icon={<CalendarDays className="h-5 w-5" />} />
          <StatCard title="Pending Review" value={String(pendingBookings)} detail="Bookings waiting for action" icon={<CircleAlert className="h-5 w-5" />} />
          <StatCard title="Verified Vendors" value={String(verifiedVendors)} detail="Across all categories" icon={<BadgeCheck className="h-5 w-5" />} />
          <StatCard title="Avg. Planning" value={`${avgProgress}%`} detail="Couple progress average" icon={<TrendingUp className="h-5 w-5" />} />
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.55fr_1fr]">
          <div className="space-y-8">
            <Panel id="service-intake" title="Service Intake" subtitle="Post new vendor services here and the wedding site will read them back from Prisma.">
              <CreateVendorForm />
            </Panel>

            <Panel id="bookings" title="Booking Queue" subtitle="Live booking records pulled from Prisma, with a fallback set for first-time setups.">
              <div className="overflow-hidden rounded-2xl border border-[#eadfcb] bg-white">
                <div className="grid grid-cols-12 border-b border-[#eadfcb] bg-[#fbf7ef] px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#74857c]">
                  <div className="col-span-4">Customer / Service</div>
                  <div className="col-span-2">Category</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-2">Amount</div>
                  <div className="col-span-2 text-right">Status</div>
                </div>
                <div className="divide-y divide-[#f0e6d6]">
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="grid grid-cols-12 items-center px-4 py-4 text-sm">
                      <div className="col-span-4 pr-4">
                        <p className="font-medium text-[#17352c]">{booking.userName}</p>
                        <p className="mt-1 text-xs text-[#6e7e76]">{booking.service}</p>
                      </div>
                      <div className="col-span-2 text-[#567066]">{booking.category}</div>
                      <div className="col-span-2 text-[#567066]">{formatDate(booking.date)}</div>
                      <div className="col-span-2 font-medium text-[#17352c]">{formatLkr(booking.amount)}</div>
                      <div className="col-span-2 flex justify-end">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusTone[booking.status]}`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>

            <div className="grid gap-8 lg:grid-cols-2">
              <Panel id="vendors" title="Vendor Approvals" subtitle="Top-rated vendors and their moderation state.">
                <div className="space-y-3">
                  {vendors.slice(0, 4).map((vendor) => (
                    <div key={vendor.id} className="rounded-2xl border border-[#eadfcb] bg-white p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-[#17352c]">{vendor.businessName}</p>
                          <p className="mt-1 text-sm text-[#6e7e76]">{vendor.category} · {vendor.location}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${badgeTone[vendor.badge]}`}>
                          {vendor.badge}
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm text-[#567066]">
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="h-4 w-4 text-[#1f6f58]" />
                          {vendor.verified ? "Verified" : "Needs review"}
                        </span>
                        <span>{vendor.reviewCount} reviews</span>
                        <span>{vendor.packages} packages</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Platform Health" subtitle="Fast snapshot of the current marketplace state.">
                <div className="space-y-4">
                  <MetricBar label="Verified vendors" value={verifiedVendors} total={vendors.length} tone="bg-[#1f6f58]" />
                  <MetricBar label="Confirmed bookings" value={confirmedBookings} total={bookings.length} tone="bg-[#d2ad5f]" />
                  <MetricBar label="Active couples" value={users.length} total={Math.max(users.length, 1)} tone="bg-[#7a5c2e]" />
                </div>
              </Panel>
            </div>

            <Panel title="Wedding Journey Modules" subtitle="These are the same event stages the wedding app already exposes to couples.">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {weddingModules.map((module) => (
                  <Link key={module.title} href={module.href} className={`rounded-2xl border border-[#eadfcb] bg-linear-to-br ${module.tone} p-4 transition hover:-translate-y-0.5 hover:shadow-md`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-[#17352c]">{module.title}</p>
                        <p className="mt-1 text-sm leading-6 text-[#6e7e76]">{module.subtitle}</p>
                      </div>
                      <HeartHandshake className="h-4 w-4 text-[#1f6f58]" />
                    </div>
                  </Link>
                ))}
              </div>
            </Panel>
          </div>

          <aside className="space-y-8">
            <Panel id="users" title="User Management" subtitle="Current couples and planning progress.">
              <div className="space-y-4">
                {users.slice(0, 5).map((user) => (
                  <div key={user.id} className="rounded-2xl border border-[#eadfcb] bg-white p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-[#17352c]">{user.name}</p>
                        <p className="mt-1 text-xs text-[#6e7e76]">{user.email}</p>
                        <p className="mt-1 text-xs text-[#6e7e76]">{user.location ?? "Location not set"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-[#1f6f58]">{user.planningProgress}%</p>
                        <p className="text-xs text-[#6e7e76]">planning</p>
                      </div>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-[#f0e6d6]">
                      <div className="h-2 rounded-full bg-linear-to-r from-[#1f6f58] to-[#d2ad5f]" style={{ width: `${user.planningProgress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Quick Actions" subtitle="Shortcuts for common admin tasks.">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <ActionCard icon={<Users className="h-4 w-4" />} label="Manage users" href="#users" />
                <ActionCard icon={<VenetianMask className="h-4 w-4" />} label="Review vendors" href="#vendors" />
                <ActionCard icon={<CreditCard className="h-4 w-4" />} label="Check payments" href="#bookings" />
                <ActionCard icon={<UtensilsCrossed className="h-4 w-4" />} label="Open services" href="/services" />
                <ActionCard icon={<Gift className="h-4 w-4" />} label="Gift exchange" href="/gift-exchange" />
              </div>
            </Panel>

            <Panel title="System Note" subtitle="Database connection and stack details.">
              <div className="rounded-2xl border border-[#eadfcb] bg-white p-4 text-sm leading-6 text-[#567066]">
                <p>
                  This admin page uses the same Next.js App Router stack as the wedding booking app and reads from Prisma through the shared [DATABASE_URL](../.env).
                </p>
                <p className="mt-3">
                  If the database has no rows yet, the page falls back to the same wedding-themed sample data shown in the booking UI, and the service intake form writes directly to the shared vendor table.
                </p>
              </div>
            </Panel>
          </aside>
        </div>

        <div className="mt-8 rounded-[28px] border border-[#eadfcb] bg-white p-6 shadow-[0_18px_60px_rgba(24,60,50,0.06)]">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl text-[#17352c]">Revenue Outlook</h2>
              <p className="mt-1 text-sm text-[#6e7e76]">Simple visual summary of booking mix by volume.</p>
            </div>
            <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-[#d9c5a1] px-4 py-2 text-sm text-[#1f6f58] transition hover:bg-[#fbf7ef]">
              Back to site
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Wedding Halls", value: 42, color: "from-[#1f6f58] to-[#2e8b71]" },
              { label: "Catering", value: 34, color: "from-[#d2ad5f] to-[#e3c67f]" },
              { label: "Photography", value: 24, color: "from-[#7a5c2e] to-[#a78245]" },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-[#eadfcb] bg-[#fbf7ef] p-5">
                <div className="flex items-center justify-between text-sm text-[#6e7e76]">
                  <span>{item.label}</span>
                  <span>{item.value}%</span>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
                  <div className={`h-full rounded-full bg-linear-to-r ${item.color}`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Panel({
  id,
  title,
  subtitle,
  children,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="rounded-[28px] border border-[#eadfcb] bg-white p-6 shadow-[0_12px_40px_rgba(24,60,50,0.05)]">
      <div className="mb-5">
        <h2 className="font-serif text-2xl text-[#17352c]">{title}</h2>
        {subtitle && <p className="mt-1 text-sm leading-6 text-[#6e7e76]">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function StatCard({
  title,
  value,
  detail,
  icon,
}: {
  title: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-[#eadfcb] bg-white p-6 shadow-[0_10px_30px_rgba(24,60,50,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[#6e7e76]">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-[#17352c]">{value}</p>
          <p className="mt-2 text-sm text-[#567066]">{detail}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f7f1e2] text-[#1f6f58]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function MetricBar({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: string;
}) {
  const width = Math.max(Math.min((value / Math.max(total, 1)) * 100, 100), 6);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-[#17352c]">{label}</span>
        <span className="text-[#6e7e76]">{value}/{total}</span>
      </div>
      <div className="h-2 rounded-full bg-[#f0e6d6]">
        <div className={`h-2 rounded-full ${tone}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function ActionCard({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-2xl border border-[#eadfcb] bg-[#fbf7ef] px-4 py-3 text-sm text-[#17352c] transition hover:border-[#d7bf95] hover:bg-white"
    >
      <span className="flex items-center gap-2">
        <span className="text-[#1f6f58]">{icon}</span>
        {label}
      </span>
      <ChevronRight className="h-4 w-4 text-[#8b9a92]" />
    </Link>
  );
}