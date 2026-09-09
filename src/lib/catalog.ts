import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  price: number;
  discount_percent: number;
  stock: number;
  gender: string;
  age_group: string;
  sizes: string[];
  images: string[];
  is_featured: boolean;
  is_active: boolean;
};

export type ShippingRate = {
  id: string;
  label: string;
  province: string | null;
  city: string | null;
  region: string | null;
  cost: number;
  free_threshold: number | null;
  sort_order: number;
  is_default: boolean;
};

export type SettingKey = "business_hours" | "website_url" | "free_shipping_threshold";
export type Settings = Partial<Record<SettingKey, string>>;

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, sort_order")
      .order("sort_order");
    if (error) throw error;
    return (data ?? []) as Category[];
  },
});

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Product[];
  },
});

export const shippingRatesQuery = queryOptions({
  queryKey: ["shipping_rates"],
  queryFn: async (): Promise<ShippingRate[]> => {
    const { data, error } = await supabase
      .from("shipping_rates")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as ShippingRate[];
  },
});

export const settingsQuery = queryOptions({
  queryKey: ["settings"],
  queryFn: async (): Promise<Settings> => {
    const { data, error } = await supabase.from("settings").select("key, value");
    if (error) throw error;
    return Object.fromEntries(
      (data ?? []).map((s) => [s.key, s.value]),
    ) as Settings;
  },
});
