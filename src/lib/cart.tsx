import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string | null;
  size: string | null;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  add: (item: CartItem) => void;
  remove: (id: string, size: string | null) => void;
  setQty: (id: string, size: string | null, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "takshakh-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const value: CartContextValue = {
    items,
    count: items.reduce((s, i) => s + i.qty, 0),
    total: items.reduce((s, i) => s + i.qty * i.price, 0),
    add: (item) =>
      setItems((prev) => {
        const found = prev.find((p) => p.id === item.id && p.size === item.size);
        if (found) {
          return prev.map((p) =>
            p === found ? { ...p, qty: p.qty + item.qty } : p,
          );
        }
        return [...prev, item];
      }),
    remove: (id, size) =>
      setItems((prev) => prev.filter((p) => !(p.id === id && p.size === size))),
    setQty: (id, size, qty) =>
      setItems((prev) =>
        prev.map((p) =>
          p.id === id && p.size === size ? { ...p, qty: Math.max(1, qty) } : p,
        ),
      ),
    clear: () => setItems([]),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
