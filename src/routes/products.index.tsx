import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { categoriesQuery, productsQuery } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { AGE_LABELS, GENDER_LABELS, finalPrice, formatPrice, toFa } from "@/lib/format";

type ProductSearch = { cat: string | undefined; q: string | undefined };

export const Route = createFileRoute("/products/")({
  validateSearch: (search: Record<string, unknown>): ProductSearch => ({
    cat: typeof search["cat"] === "string" ? search["cat"] : undefined,
    q: typeof search["q"] === "string" ? search["q"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "همه محصولات | تک شاخ کیدز" },
      {
        name: "description",
        content:
          "جست‌وجو و فیلتر محصولات تک شاخ کیدز بر اساس دسته، سن، جنسیت، سایز و بازه قیمت.",
      },
      { property: "og:title", content: "همه محصولات | تک شاخ کیدز" },
      {
        property: "og:description",
        content: "لباس، کیف، کش مو و اکسسوری کودک و نوجوان.",
      },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(categoriesQuery),
      context.queryClient.ensureQueryData(productsQuery),
    ]);
  },
  component: ProductsPage,
});

const AGES = ["baby", "kids", "teen"];
const GENDERS = ["girl", "boy", "unisex"];

function ProductsPage() {
  const search = Route.useSearch();
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const { data: products } = useSuspenseQuery(productsQuery);

  const [q, setQ] = useState(search.q ?? "");
  const [cat, setCat] = useState(search.cat ?? "");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [size, setSize] = useState("");
  const [maxPrice, setMaxPrice] = useState(0);

  const priceCeil = useMemo(
    () =>
      Math.max(
        100000,
        ...products.map((p) => finalPrice(p.price, p.discount_percent)),
      ),
    [products],
  );
  const limit = maxPrice || priceCeil;

  const allSizes = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.sizes))),
    [products],
  );

  const catId = categories.find((c) => c.slug === cat)?.id;

  const filtered = products.filter((p) => {
    if (!p.is_active) return false;
    if (q && !p.name.includes(q) && !(p.description ?? "").includes(q)) return false;
    if (catId && p.category_id !== catId) return false;
    if (gender && p.gender !== gender) return false;
    if (age && p.age_group !== age) return false;
    if (size && !p.sizes.includes(size)) return false;
    if (finalPrice(p.price, p.discount_percent) > limit) return false;
    return true;
  });

  const reset = () => {
    setQ("");
    setCat("");
    setGender("");
    setAge("");
    setSize("");
    setMaxPrice(0);
  };

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-card text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-xl font-extrabold text-foreground">همه محصولات</h1>

      <div className="mt-4 rounded-3xl border border-border bg-card p-4">
        <div className="relative">
          <Search className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="جست‌وجوی محصول…"
            className="w-full rounded-2xl border border-input bg-background py-3 pr-10 pl-4 text-sm outline-none focus:border-primary"
          />
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">دسته:</span>
            <button className={chip(!cat)} onClick={() => setCat("")} type="button">
              همه
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                className={chip(cat === c.slug)}
                onClick={() => setCat(c.slug)}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">جنسیت:</span>
            <button className={chip(!gender)} onClick={() => setGender("")} type="button">
              همه
            </button>
            {GENDERS.map((g) => (
              <button
                key={g}
                type="button"
                className={chip(gender === g)}
                onClick={() => setGender(g)}
              >
                {GENDER_LABELS[g]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">گروه سنی:</span>
            <button className={chip(!age)} onClick={() => setAge("")} type="button">
              همه
            </button>
            {AGES.map((a) => (
              <button
                key={a}
                type="button"
                className={chip(age === a)}
                onClick={() => setAge(a)}
              >
                {AGE_LABELS[a]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">سایز:</span>
            <button className={chip(!size)} onClick={() => setSize("")} type="button">
              همه
            </button>
            {allSizes.map((s) => (
              <button
                key={s}
                type="button"
                className={chip(size === s)}
                onClick={() => setSize(s)}
              >
                {toFa(s)}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-muted-foreground">حداکثر قیمت:</span>
            <input
              type="range"
              min={50000}
              max={priceCeil}
              step={10000}
              value={limit}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="h-1.5 w-48 accent-[var(--primary)]"
            />
            <span className="text-xs font-bold text-foreground">{formatPrice(limit)}</span>
            <button
              type="button"
              onClick={reset}
              className="mr-auto rounded-full border border-border px-4 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              حذف فیلترها
            </button>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        {toFa(filtered.length)} محصول یافت شد
      </p>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          محصولی با این فیلترها پیدا نشد.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
