import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import logo from "@/assets/unicorn-logo.jpg.asset.json";
import { useCart } from "@/lib/cart";
import { toFa } from "@/lib/format";

const NAV = [
  { to: "/", label: "خانه" },
  { to: "/products", label: "همه محصولات" },
  { to: "/offers", label: "تخفیف‌دار" },
  { to: "/contact", label: "تماس با ما" },
] as const;


export function SiteHeader() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="منو"
          className="rounded-xl p-2 text-foreground md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        <Link to="/" className="flex items-center gap-2">
          <img
            src={logo.url}
            alt="تک شاخ کیدز"
            width={40}
            height={40}
            className="size-10 rounded-full object-cover"
          />
          <span className="text-base font-extrabold text-foreground">تک شاخ کیدز</span>
        </Link>

        <nav className="mr-4 hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="mr-auto flex items-center gap-1">
          <Link
            to="/products"
            aria-label="جست‌وجو"
            className="rounded-xl p-2 text-muted-foreground hover:text-foreground"
          >
            <Search className="size-5" />
          </Link>
          <Link to="/cart" aria-label="سبد خرید" className="relative rounded-xl p-2 text-foreground">
            <ShoppingBag className="size-5" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {toFa(count)}
              </span>
            )}
          </Link>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-4 py-2 md:hidden">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-3 text-sm text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
