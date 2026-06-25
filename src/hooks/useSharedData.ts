import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";

interface Vendor {
  id: number;
  businessName: string;
  category: string;
  location: string;
  rating: number;
  reviewCount: number;
  packages: number;
  startingPrice: string | null;
  badge: string;
  verified: boolean;
  image: string | null;
}

interface Deal {
  id: number;
  title: string;
  category: string;
  originalPrice: number;
  discountedPrice: number;
  discount: number;
  validUntil: string;
  description: string;
  isActive: boolean;
  bookings: number;
  images: string[];
}

export function useVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getVendors();
        setVendors(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load vendors");
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  return { vendors, loading, error, refetch: async () => {
    const data = await apiClient.getVendors();
    setVendors(data);
  }};
}

export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getDeals();
        setDeals(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load deals");
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  return { deals, loading, error, refetch: async () => {
    const data = await apiClient.getDeals();
    setDeals(data);
  }};
}
