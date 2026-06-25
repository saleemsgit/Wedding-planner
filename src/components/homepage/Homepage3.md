# WeddingSL Homepage UI (React + TypeScript + Tailwind CSS)

## 1. Install Tailwind (if not installed)

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Configure Tailwind:

### tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### src/index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: Inter, sans-serif;
  background: #f8f5ef;
}
```

---

# 2. Install Icons

```bash
npm install lucide-react
```

---

# 3. Homepage Component

## src/pages/HomePage.tsx

```tsx
import {
  Heart,
  User,
  Sparkles,
  Bell,
  TrendingUp,
  Briefcase,
  Send,
  Star,
} from "lucide-react";

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
  return (
    <div className="min-h-screen bg-[#f8f5ef] text-[#124734]">
      {/* Navbar */}
      <nav className="w-full border-b border-[#e5ded1] bg-[#f9f7f2]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#d8b55b] flex items-center justify-center shadow-md">
              <Heart className="text-white w-6 h-6 fill-white" />
            </div>

            <div>
              <h1 className="font-bold text-2xl">WeddingSL</h1>
              <p className="text-sm text-[#6b7b74]">
                Muslim Wedding Platform
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <div className="hidden lg:flex items-center gap-10 text-[15px] font-medium">
            <button className="bg-[#f3eee2] text-[#c8a34f] px-5 py-2 rounded-xl">
              Home
            </button>
            <button>Services</button>
            <button>My Planner</button>
            <button>Gift Exchange</button>
            <button>Mehndi Night</button>
            <button>For Vendors</button>
          </div>

          {/* Profile */}
          <button className="flex items-center gap-2 bg-[#0f5a43] text-white px-6 py-3 rounded-2xl hover:bg-[#0c4836] transition-all">
            <User size={18} />
            My Profile
          </button>
        </div>
      </nav>

      {/* AI Recommendation Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 border border-[#eadfcb] px-5 py-3 rounded-full text-[#c69d47] bg-[#faf7f0] mb-8">
              <Briefcase size={16} />
              AI-Powered Planning
            </div>

            <h1 className="text-5xl lg:text-6xl leading-tight font-serif mb-8 text-[#0f5942]">
              Smart Recommendations
              <br />
              Just for You
            </h1>

            <p className="text-[#607067] text-xl leading-10 mb-10 max-w-2xl">
              Our AI wedding assistant analyzes your budget, dates, and
              preferences to suggest the perfect vendors, themes, and timeline
              specifically for Sri Lankan Muslim weddings.
            </p>

            {/* Tips */}
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

          {/* Right Chat Card */}
          <div className="bg-[#0f5a43] rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden">
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:30px_30px]"></div>

            <div className="relative z-10">
              {/* Header */}
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

              {/* Chat */}
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

              {/* Input */}
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

      {/* Testimonials Section */}
      <section className="bg-[#0f5a43] py-28 px-6 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:40px_40px]"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Heading */}
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

          {/* Cards */}
          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((item, index) => (
              <div
                key={index}
                className="bg-[#3f715f]/70 backdrop-blur-sm border border-[#789688] rounded-[30px] p-8 hover:-translate-y-2 transition-all duration-300"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-8">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-[#d8b55b] fill-[#d8b55b]"
                    />
                  ))}
                </div>

                {/* Review */}
                <p className="text-[#f2f6f3] text-xl leading-10 mb-10">
                  “{item.review}”
                </p>

                {/* Footer */}
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
    </div>
  );
}
```

---

# 4. App.tsx

```tsx
import HomePage from "./pages/HomePage";

function App() {
  return <HomePage />;
}

export default App;
```

---

# 5. Features Included

✅ Premium Sri Lankan Muslim wedding UI
✅ Modern navbar
✅ AI recommendation section
✅ Interactive AI assistant card
✅ Testimonial cards
✅ Fully responsive
✅ Tailwind styling
✅ React + TypeScript ready
✅ Modern gradients, shadows, rounded corners
✅ Lucide React icons

---

# 6. Optional Improvements

You can later add:

* Firebase Authentication
* Real AI Chatbot
* Vendor booking system
* Wedding planner calendar
* Gift exchange management
* Real testimonials from Firestore
* Dark mode
* Framer Motion animations
* Swiper sliders
* Mobile sidebar menu
* Vendor dashboard
