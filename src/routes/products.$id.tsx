import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { categoriesQuery, productsQuery } from "@/lib/catalog";
import { AGE_LABELS, GENDER_LABELS, finalPrice, formatPrice, toFa } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/products/$id")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(categoriesQuery),
      context.queryClient.ensureQueryData(productsQuery),
    ]);
  },
  head: () => ({
    meta: [
      { title: "جزئیات محصول | تک شاخ کیدز" },
      {
        name: "description",
        content: "مشخصات، سایزبندی و قیمت محصول در فروشگاه تک شاخ کیدز.",
      },
      { property: "og:title", content: "جزئیات محصول | تک شاخ کیدز" },
      { property: "og:description", content: "مشخصات و قیمت محصول کودک و نوجوان." },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { data: products } = useSuspenseQuery(productsQuery);
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const { add } = useCart();
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center">
        <p className="text-sm text-muted-foreground">این محصول پیدا نشد.</p>
        <Link to="/products" className="mt-4 inline-block text-sm text-primary">
          بازگشت به محصولات
        </Link>
      </div>
    );
  }

  const price = finalPrice(product.price, product.discount_percent);
  const category = categories.find((c) => c.id === product.category_id);
  const related = products
    .filter((p) => p.id !== product.id && p.category_id === product.category_id)
    .slice(0, 4);

  const onAdd = () => {
    add({
      id: product.id,
      name: product.name,
      price,
      image: product.images[0] ?? null,
      size: size ?? product.sizes[0] ?? null,
      qty: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-border bg-muted">
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              width={800}
              height={800}
              className="aspect-square w-full object-cover"
            />
          ) : (
            <div className="grid aspect-square place-items-center text-sm text-muted-foreground">
              بدون تصویر
            </div>
          )}
        </div>

        <div className="space-y-5">
          {category && (
            <Link
              to="/products"
              search={{ cat: category.slug }}
              className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground"
            >
              {category.name}
            </Link>
          )}
          <h1 className="text-xl font-extrabold text-foreground sm:text-2xl">
            {product.name}
          </h1>
          <p className="text-sm leading-7 text-muted-foreground">{product.description}</p>

          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-extrabold text-foreground">
              {formatPrice(price)}
            </span>
            {product.discount_percent > 0 && (
              <>
                <span className="text-sm text-muted-foreground line-through">
                  {toFa(product.price.toLocaleString("en-US"))}
                </span>
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                  {toFa(product.discount_percent)}٪
                </span>
              </>
            )}
          </div>

          <dl className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-2xl bg-secondary/60 p-3">
              <dt className="text-muted-foreground">جنسیت</dt>
              <dd className="font-bold text-foreground">
                {GENDER_LABELS[product.gender] ?? product.gender}
              </dd>
            </div>
            <div className="rounded-2xl bg-secondary/60 p-3">
              <dt className="text-muted-foreground">گروه سنی</dt>
              <dd className="font-bold text-foreground">
                {AGE_LABELS[product.age_group] ?? product.age_group}
              </dd>
            </div>
          </dl>

          {product.sizes.length > 0 && (
            <div>
              <p className="mb-2 text-xs text-muted-foreground">انتخاب سایز</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`rounded-full border px-4 py-2 text-xs font-bold transition-colors ${
                      (size ?? product.sizes[0]) === s
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground"
                    }`}
                  >
                    {toFa(s)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            {product.stock > 0 ? `موجودی: ${toFa(product.stock)} عدد` : "این محصول ناموجود است"}
          </p>

          <button
            type="button"
            disabled={product.stock === 0}
            onClick={onAdd}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {added ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}
            {added ? "به سبد اضافه شد" : "افزودن به سبد خرید"}
          </button>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-4 text-lg font-extrabold text-foreground">محصولات مشابه</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
