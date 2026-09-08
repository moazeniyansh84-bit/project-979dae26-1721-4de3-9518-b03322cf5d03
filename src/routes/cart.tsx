import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatPrice, toFa } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "سبد خرید | تک شاخ کیدز" },
      { name: "description", content: "مرور و ویرایش سبد خرید در فروشگاه تک شاخ کیدز." },
      { property: "og:title", content: "سبد خرید | تک شاخ کیدز" },
      { property: "og:description", content: "سبد خرید شما در تک شاخ کیدز." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, total, remove, setQty, clear } = useCart();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-xl font-extrabold text-foreground">سبد خرید</h1>

      {items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm text-muted-foreground">سبد خرید شما خالی است.</p>
          <Link
            to="/products"
            className="mt-4 inline-block rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
          >
            رفتن به فروشگاه
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-6 space-y-3">
            {items.map((i) => (
              <li
                key={`${i.id}-${i.size}`}
                className="flex items-center gap-3 rounded-3xl border border-border bg-card p-3"
              >
                {i.image ? (
                  <img
                    src={i.image}
                    alt={i.name}
                    loading="lazy"
                    width={80}
                    height={80}
                    className="size-20 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="size-20 rounded-2xl bg-muted" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-foreground">{i.name}</p>
                  {i.size && (
                    <p className="text-xs text-muted-foreground">سایز: {toFa(i.size)}</p>
                  )}
                  <p className="mt-1 text-sm font-extrabold text-foreground">
                    {formatPrice(i.price * i.qty)}
                  </p>
                </div>
                <div className="flex items-center gap-1 rounded-full border border-border px-2 py-1">
                  <button
                    type="button"
                    aria-label="کاهش"
                    onClick={() => setQty(i.id, i.size, i.qty - 1)}
                    className="px-2 text-sm text-foreground"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-bold">{toFa(i.qty)}</span>
                  <button
                    type="button"
                    aria-label="افزایش"
                    onClick={() => setQty(i.id, i.size, i.qty + 1)}
                    className="px-2 text-sm text-foreground"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  aria-label="حذف"
                  onClick={() => remove(i.id, i.size)}
                  className="rounded-xl p-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-3xl border border-border bg-card p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">مبلغ قابل پرداخت</span>
              <span className="text-lg font-extrabold text-foreground">
                {formatPrice(total)}
              </span>
            </div>
            <button
              type="button"
              className="mt-4 w-full rounded-full bg-primary px-6 py-4 text-sm font-bold text-primary-foreground"
            >
              ادامه فرایند خرید
            </button>
            <button
              type="button"
              onClick={clear}
              className="mt-2 w-full rounded-full border border-border px-6 py-3 text-sm text-muted-foreground"
            >
              خالی کردن سبد
            </button>
          </div>
        </>
      )}
    </div>
  );
}
