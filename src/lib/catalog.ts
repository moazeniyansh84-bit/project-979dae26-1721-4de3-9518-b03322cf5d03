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
