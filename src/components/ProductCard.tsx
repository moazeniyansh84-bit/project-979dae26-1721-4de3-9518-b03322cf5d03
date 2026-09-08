import { Link } from "@tanstack/react-router";
import { finalPrice, formatPrice, toFa } from "@/lib/format";
import type { Product } from "@/lib/catalog";

export function ProductCard({ product }: { product: Product }) {
  const off = product.discount_percent > 0;
  const price = finalPrice(product.price, product.discount_percent);

  return (
    <Link
      to="/products/$id"
      params={{ id: product.id }}
      className="group block overflow-hidden rounded-3xl border border-border bg-card transition-shadow hover:shadow-[0_12px_30px_-18px_var(--brand-shadow)]"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            بدون تصویر
          </div>
        )}
        {off && (
          <span className="absolute top-3 left-3 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
            {toFa(product.discount_percent)}٪ تخفیف
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-3 right-3 rounded-full bg-foreground/80 px-2.5 py-1 text-xs text-background">
            ناموجود
          </span>
        )}
      </div>
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-1 text-sm font-bold text-foreground">{product.name}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-extrabold text-foreground">{formatPrice(price)}</span>
          {off && (
            <span className="text-xs text-muted-foreground line-through">
              {toFa(product.price.toLocaleString("en-US"))}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
