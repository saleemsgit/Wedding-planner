"use client";

import { useState } from "react";

const categoryOptions = [
  "Wedding Halls",
  "Catering",
  "Photography",
  "Bridal",
  "Mehndi",
  "Cars",
  "Religious",
];

type FormState = {
  businessName: string;
  category: string;
  location: string;
  startingPrice: string;
  rating: string;
  reviewCount: string;
  packages: string;
  badge: "Available" | "Limited" | "Booked";
  verified: boolean;
  image: string;
};

const initialState: FormState = {
  businessName: "",
  category: "Wedding Halls",
  location: "",
  startingPrice: "",
  rating: "4.8",
  reviewCount: "0",
  packages: "1",
  badge: "Available",
  verified: false,
  image: "",
};

export default function CreateVendorForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");

    try {
      const response = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          rating: Number(form.rating),
          reviewCount: Number(form.reviewCount),
          packages: Number(form.packages),
        }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Failed to create vendor");

      setStatus("saved");
      setForm(initialState);
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[24px] border border-[#eadfcb] bg-[#fbf7ef] p-5">
      <div>
        <p className="text-sm font-medium text-[#17352c]">Create a service</p>
        <p className="mt-1 text-sm text-[#6e7e76]">Add a vendor row that the wedding services page can read back from Prisma.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <input
          value={form.businessName}
          onChange={(event) => setForm((current) => ({ ...current, businessName: event.target.value }))}
          placeholder="Business name"
          className="rounded-2xl border border-[#d9c5a1] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1f6f58]"
          required
        />
        <select
          value={form.category}
          onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
          className="rounded-2xl border border-[#d9c5a1] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1f6f58]"
        >
          {categoryOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <input
          value={form.location}
          onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
          placeholder="Location"
          className="rounded-2xl border border-[#d9c5a1] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1f6f58]"
          required
        />
        <input
          value={form.startingPrice}
          onChange={(event) => setForm((current) => ({ ...current, startingPrice: event.target.value }))}
          placeholder="Starting price"
          className="rounded-2xl border border-[#d9c5a1] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1f6f58]"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <input
          value={form.rating}
          onChange={(event) => setForm((current) => ({ ...current, rating: event.target.value }))}
          type="number"
          min="0"
          max="5"
          step="0.1"
          placeholder="Rating"
          className="rounded-2xl border border-[#d9c5a1] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1f6f58]"
        />
        <input
          value={form.reviewCount}
          onChange={(event) => setForm((current) => ({ ...current, reviewCount: event.target.value }))}
          type="number"
          min="0"
          placeholder="Review count"
          className="rounded-2xl border border-[#d9c5a1] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1f6f58]"
        />
        <input
          value={form.packages}
          onChange={(event) => setForm((current) => ({ ...current, packages: event.target.value }))}
          type="number"
          min="1"
          placeholder="Packages"
          className="rounded-2xl border border-[#d9c5a1] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1f6f58]"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
        <select
          value={form.badge}
          onChange={(event) => setForm((current) => ({ ...current, badge: event.target.value as FormState["badge"] }))}
          className="rounded-2xl border border-[#d9c5a1] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1f6f58]"
        >
          <option value="Available">Available</option>
          <option value="Limited">Limited</option>
          <option value="Booked">Booked</option>
        </select>

        <label className="flex items-center gap-2 rounded-2xl border border-[#d9c5a1] bg-white px-4 py-3 text-sm text-[#17352c]">
          <input
            type="checkbox"
            checked={form.verified}
            onChange={(event) => setForm((current) => ({ ...current, verified: event.target.checked }))}
          />
          Verified
        </label>

        <input
          value={form.image}
          onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))}
          placeholder="Image URL"
          className="rounded-2xl border border-[#d9c5a1] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1f6f58]"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="rounded-full bg-[#1f6f58] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#185444]">
          Create service
        </button>
        {status === "saving" && <span className="text-sm text-[#6e7e76]">Saving...</span>}
        {status === "saved" && <span className="text-sm text-emerald-700">Saved to Prisma</span>}
        {status === "error" && <span className="text-sm text-rose-700">Could not save service</span>}
      </div>
    </form>
  );
}