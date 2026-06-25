// API Client for communicating with Admin Page
const ADMIN_API_BASE = process.env.NEXT_PUBLIC_ADMIN_API || "http://localhost:3000/api";

interface VendorData {
  businessName: string;
  category: string;
  location: string;
  startingPrice?: string;
  badge?: string;
  verified?: boolean;
  image?: string;
  rating?: number;
  reviewCount?: number;
  packages?: number;
}

interface DealData {
  title: string;
  category: string;
  originalPrice: number;
  discountedPrice: number;
  validUntil: string;
  description: string;
  isActive?: boolean;
  images?: string[];
}

export const apiClient = {
  // Vendors
  async getVendors() {
    try {
      const response = await fetch(`${ADMIN_API_BASE}/vendors`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch vendors");
      const data = await response.json();
      return data.vendors || [];
    } catch (error) {
      console.error("Error fetching vendors:", error);
      return [];
    }
  },

  async createVendor(vendor: VendorData) {
    try {
      const response = await fetch(`${ADMIN_API_BASE}/vendors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vendor),
      });
      if (!response.ok) throw new Error("Failed to create vendor");
      const data = await response.json();
      return data.vendor;
    } catch (error) {
      console.error("Error creating vendor:", error);
      throw error;
    }
  },

  // Deals
  async getDeals() {
    try {
      const response = await fetch(`${ADMIN_API_BASE}/deals`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch deals");
      const data = await response.json();
      return data.deals || [];
    } catch (error) {
      console.error("Error fetching deals:", error);
      return [];
    }
  },

  async createDeal(deal: DealData) {
    try {
      const response = await fetch(`${ADMIN_API_BASE}/deals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deal),
      });
      if (!response.ok) throw new Error("Failed to create deal");
      const data = await response.json();
      return data.deal;
    } catch (error) {
      console.error("Error creating deal:", error);
      throw error;
    }
  },
};
